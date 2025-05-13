import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/products.service';
import { Product } from './model/product.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ecommerce-agentic-ai';
  public productsService = inject(ProductService);

  productList = signal<Product[]>([]);

  constructor() {
    this.productList.set(this.productsService.getProducts());
  }

  /** Update the product cart
   * @argument product: product from the product list.
   */
  public addToCart(product: Product): void {
    this.productsService.addToCart(product);
  }
}
