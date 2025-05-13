import { inject, Inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  GenerativeModel,
  VertexAI,
  getGenerativeModel,
  getVertexAI,
  ChatSession,
  FunctionDeclarationsTool,
  Schema,
  ObjectSchemaInterface,
} from 'firebase/vertexai';
import { Product } from '../model/product';
import { ProductService } from './products.service';

@Injectable({
  providedIn: 'root',
})
export class VertexAIService {
  private readonly model: GenerativeModel;
  private readonly chat: ChatSession;
  private productService = inject(ProductService);

  // Inject a Firebase application instance into the class.
  constructor(@Inject('FIREBASE_APP') private firebaseApp: FirebaseApp) {
    const productsToolSet: FunctionDeclarationsTool = {
      functionDeclarations: [
        {
          name: 'getNumberOfProducts',
          description:
            'Get a count of the number of products available in the inventory.',
        },
        {
          name: 'getProducts',
          description:
            'Get an array of the products with the name and price of each product.',
        },
        {
          name: 'addToCart',
          description: 'Add one or more products to the cart.',
          parameters: Schema.object({
            properties: {
              productsToAdd: Schema.array({
                items: Schema.object({
                  description: 'A single product with its name and price.',
                  properties: {
                    name: Schema.string({
                      description: 'The name of the product.',
                    }),
                    price: Schema.number({
                      description: 'The numerical price of the product.',
                    }),
                  },
                  // Specify which properties within each product object are required
                  required: ['name', 'price'],
                }),
              }),
            },
          }) as ObjectSchemaInterface,
        },
      ],
    };

    // Initialize VertexAI API Service.
    const vertexAI = getVertexAI(this.firebaseApp);

    const systemInstruction = `Welcome to Ecommerce Agentic AI.
    You are a superstar agent for this ecommerce store.
    You will assist users by answering questions about the inventory and event being able to add items to the cart.`;

    // Initializing a GenerativeModel model.
    this.model = getGenerativeModel(vertexAI, {
      model: 'gemini-2.0-flash',
      systemInstruction,
      tools: [productsToolSet],
    });

    this.chat = this.model.startChat();
  }

  async ask(prompt: string) {
    let result = await this.chat.sendMessage(prompt);
    const functionCalls = result.response.functionCalls();

    if (functionCalls && functionCalls.length) {
      for (const functionCall of functionCalls) {
        switch (functionCall.name) {
          case 'getNumberOfProducts': {
            const functionResult = this.getNumberOfProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { numberOfProducts: functionResult },
                },
              },
            ]);
            break;
          }
          case 'getProducts': {
            const functionResult = this.getProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { products: functionResult },
                },
              },
            ]);
            break;
          }
          case 'addToCart': {
            const args = functionCall.args as { productsToAdd: Product[] };
            const functionResult = this.addToCart(args.productsToAdd);

            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { numberOfProductsAdded: functionResult },
                },
              },
            ]);
            break;
          }
        }
      }
    }

    return result.response.text();
  }

  getProducts(): Product[] {
    return this.productService.getProducts();
  }

  getNumberOfProducts(): number {
    return this.getProducts().length;
  }

  addToCart(productsToAdd: Product[]) {
    for (let i = 0; i < productsToAdd.length; i++) {
      this.productService.addToCart(productsToAdd[i]);
    }
  }
}
