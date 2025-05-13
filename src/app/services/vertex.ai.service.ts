import { inject, Injectable } from "@angular/core";
import { FirebaseApp } from "@angular/fire/app";
import { GenerativeModel, VertexAI, getGenerativeModel, getVertexAI, ChatSession } from 'firebase/vertexai';

@Injectable({
  providedIn: 'root'
})

export class VertexAIService {
  private readonly model: GenerativeModel;
  private readonly chat: ChatSession;

  private firebaseApp = inject(FirebaseApp);

  constructor() {

    // Initialize VertexAI API Service.
    const vertexAI = getVertexAI(this.firebaseApp);

    // Creating a GenerativeModel instance.
     this.model = getGenerativeModel(vertexAI, {
      model: 'gemini-2.0-flash'
    });

    this.chat = this.model.startChat();

  }
}
