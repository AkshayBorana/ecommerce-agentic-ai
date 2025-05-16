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
  FunctionCall,
  GenerateContentResult,
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
        // {
        //   name: 'getNumberOfProducts',
        //   description:
        //     'Get a count of the number of products available in the inventory.',
        // },
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
        {
          name: 'filterProducts',
          description:
          `Get the inventory list first. Update the visible inventory by filtering the available products.
          This function requires an array of product or products to filter by.
          Return a list of filtered products.`,
          parameters: Schema.object({
            properties: {
              productsToFilter: Schema.array({
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
          }) as ObjectSchemaInterface
        }
      ],
    };

    // Initialize VertexAI API Service.
    const vertexAI = getVertexAI(this.firebaseApp);

    const systemInstruction = `Welcome to Ecommerce Agentic AI.
    You are a superstar agent for this ecommerce store.
    You will assist users by answering questions about the inventory, list of products in the inventory and their respective prices and even being able to add items to the cart.
    If you're asked about ingredients to make a recipe or anything, use your tools to help you answer.
    For example you can first get the inventory which contains the items and prices for those items.`;

    // Initializing a GenerativeModel model.
    this.model = getGenerativeModel(vertexAI, {
      model: 'gemini-2.5-pro-preview-03-25',
      systemInstruction,
      tools: [productsToolSet],
    });

    this.chat = this.model.startChat();
  }

  async callFunctions(functionCalls: FunctionCall[]): Promise<GenerateContentResult> {
    let result;
      for (const functionCall of functionCalls) {
        if(functionCall.name === 'getProducts') {
          const functionResult = this.getProducts();
          result = await this.chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: { products: functionResult },
              },
            },
          ]);

          const fnCalls = result.response.functionCalls();
          if(fnCalls) {
           return this.callFunctions(fnCalls);
          }
        }

        if( functionCall.name === 'addToCart') {
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

          const fnCalls = result.response.functionCalls();
          if(fnCalls) {
           return this.callFunctions(fnCalls);
          }
        }

        if(functionCall.name === 'filterProducts') {
          const args = functionCall.args as { productsToFilter: Product[] };
          const functionResult = this.filterProducts(args.productsToFilter);
          result = await this.chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: { numberOfProductsFiltered: functionResult }
              }
            }
          ]);

          const fnCalls = result.response.functionCalls();
          if(fnCalls) {
           return this.callFunctions(fnCalls);
          }
        }

      }
    return  result!;
  }

  async ask(prompt: string) {
    let result = await this.chat.sendMessage(prompt);
    const functionCalls = result.response.functionCalls();

    if(functionCalls && functionCalls.length) {
      result = await this.callFunctions(functionCalls);
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

  private filterProducts(productsToFilter: Product[]) {
    this.productService.filterCriteria.set(productsToFilter);
  }

}
