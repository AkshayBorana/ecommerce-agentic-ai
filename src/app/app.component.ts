import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/products.service';
import { Product } from './model/product';
import { Message } from './model/message';
import { VertexAIService } from './services/vertex.ai.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public title: string = 'Ecommerce Agentic AI';

  public productsService: ProductService = inject(ProductService);
  public productList = signal<Product[]>([]);
  public messageHistory = signal<Message[]>([]);

  private chatHistoryContainer = viewChild<ElementRef>('chatHistoryContainer');
  private readonly vertexAIService = inject(VertexAIService);

  private readonly scrollEffect = effect(() => {
    if (this.messageHistory().length > 0) {
      const container = this.chatHistoryContainer();
      if (container) {
        container.nativeElement.scrollTo(
          0,
          container.nativeElement.scrollHeight + 600
        );
      }
    }
  });

  constructor() {
    this.productList.set(this.productsService.getProducts());
    this.productsService.filterCriteria.set([]);
  }

  /** Ask a question to the model */
  public async submitMessage(userMesg: HTMLInputElement) {
    const question = userMesg.value;
    if (!question) return;

    userMesg.value = '';

    // Update signal state by adding the question asked by the user.
    this.messageHistory.update((prevMessg) => [
      ...prevMessg,
      { sender: 'user', text: question },
    ]);

    const response = await this.vertexAIService.ask(question);

    // Update the signal state by adding the response by agent to the question asked by the user.
    this.messageHistory.update((prevMesg) => [
      ...prevMesg,
      { sender: 'agent', text: response },
    ]);
  }

  /** Update the product cart
   * @argument product: product from the product list.
   */
  public addToCart(product: Product): void {
    this.productsService.addToCart(product);
  }
}
