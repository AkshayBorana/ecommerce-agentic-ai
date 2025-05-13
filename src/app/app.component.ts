import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/products.service';
import { Product } from './model/product';
import { Message } from './model/message';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  public title: string = 'Ecommerce Agentic AI';

  public productsService: ProductService = inject(ProductService);
  public productList = signal<Product[]>([]);
  public messageHistory = signal<Message[]>([]);

  private chatHistoryContainer = viewChild<ElementRef>('chatHistoryContainer');


  constructor() {
    this.productList.set(this.productsService.getProducts());
  }

  /** Update the product cart
   * @argument product: product from the product list.
   */
  public addToCart(product: Product): void {
    this.productsService.addToCart(product);
  }

  public submitMessage(userMesg: HTMLInputElement) {

  }
}
