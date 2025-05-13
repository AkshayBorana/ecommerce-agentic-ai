import { computed, Injectable, signal } from '@angular/core';

interface Product {
  name: string;
  price: number;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  /** Maintains items added to Cart*/
  readonly productCart = signal<Product[]>([]);

  /** Get the total amount from the cart */
  readonly productCartTotal = computed<number>(() => {
    return this.productCart().reduce((total, product) => {
      return total + product.price;
    }, 0);
  });

  /** List of products managed by the Store. */
  private readonly products: Product[] = [
    { name: 'Apple', price: 0.99, image: 'products/apples.jpg' },
    { name: 'Banana', price: 0.59, image: 'products/bananas.jpg' },
    { name: 'Orange', price: 0.79, image: 'products/oranges.jpg' },
    { name: 'Milk', price: 3.99, image: 'products/milk.jpg' },
    { name: 'Bread', price: 2.49, image: 'products/bread.jpg' },
    { name: 'Eggs', price: 4.99, image: 'products/eggs.jpg' },
    { name: 'Cheese', price: 5.99, image: 'products/cheese.jpg' },
    { name: 'Yogurt', price: 1.99, image: 'products/yogurt.jpg' },
    { name: 'Chicken', price: 7.99, image: 'products/chicken.jpg' },
    { name: 'Rice', price: 2.99, image: 'products/rice.jpg' },
  ];

  public getProducts(): Product[] {
    return this.products;
  }

  public getCart(): Product[] {
    return this.productCart();
  }

  public addToCart(product: Product): void {
    this.productCart.update((cart) => [...cart, product]);
  }
}
