import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ChatChoice {
  message: { content: string; role: string };
}
interface ChatResponse {
  choices: ChatChoice[];
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly groqUrl = '/groq-api/openai/v1/chat/completions';
  private readonly model = 'llama-3.3-70b-versatile';
  private http = inject(HttpClient);

  getRecommendationsByGame(gameName: string): Observable<string[]> {
    const content =
      `You are a video game recommendation engine focused on similarity. ` +
      `Your goal is to find games as similar as possible to "${gameName}" in terms of genre, mechanics, setting, and feel. ` +
      `Include any game that matches well regardless of popularity, reviews, or commercial success. ` +
      `Reply with ONLY a comma-separated list of exactly 12 video game titles. ` +
      `No explanations, no numbering, no extra text. ` +
      `Example: Game A, Game B, Game C, Game D, Game E, Game F, Game G, Game H, Game I, Game J, Game K, Game L`;
    return this.callGroq(content);
  }

  getRecommendationsByGames(gameTitles: string[]): Observable<string[]> {
    const list = gameTitles.join(', ');
    const content =
      `You are a video game recommendation engine focused on similarity. ` +
      `Based on these games: ${list}, find games that share the most similar genre, mechanics, setting, and feel. ` +
      `Include any game that matches well regardless of popularity, reviews, or commercial success. ` +
      `Reply with ONLY a comma-separated list of exactly 12 video game titles. ` +
      `No explanations, no numbering, no extra text. ` +
      `Example: Game A, Game B, Game C, Game D, Game E, Game F, Game G, Game H, Game I, Game J, Game K, Game L`;
    return this.callGroq(content);
  }

  getPersonalizedRecommendations(genres: string[]): Observable<string[]> {
    const content =
      `You are a video game recommendation engine focused on similarity. ` +
      `Suggest games that best represent these genres: ${genres.join(', ')}. ` +
      `Include any game that fits well regardless of popularity, reviews, or commercial success. ` +
      `Reply with ONLY a comma-separated list of exactly 12 video game titles. ` +
      `No explanations, no numbering, no extra text. ` +
      `Example: Game A, Game B, Game C, Game D, Game E, Game F, Game G, Game H, Game I, Game J, Game K, Game L`;
    return this.callGroq(content);
  }

  private callGroq(userContent: string): Observable<string[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.groqApiKey}`,
      'Content-Type': 'application/json'
    });
    const body = {
      model: this.model,
      messages: [{ role: 'user', content: userContent }],
      max_tokens: 150,
      stream: false
    };
    return this.http.post<ChatResponse>(this.groqUrl, body, { headers }).pipe(
      map(res => this.parse(res)),
      catchError(() => of([]))
    );
  }

  private parse(response: ChatResponse): string[] {
    const text = response?.choices?.[0]?.message?.content ?? '';
    return text
      .split(',')
      .map(t => t.trim().replace(/^["'\d.\-\s]+|["'\s]+$/g, ''))
      .filter(t => t.length > 0 && t.length < 100);
  }
}
