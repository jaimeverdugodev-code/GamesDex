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
  private readonly hfUrl = '/hf-api/sambanova/v1/chat/completions';
  private readonly model = 'Meta-Llama-3.3-70B-Instruct';
  private http = inject(HttpClient);

  getRecommendationsByGame(gameName: string): Observable<string[]> {
    const content =
      `You are a video game recommendation engine. ` +
      `Recommend ONLY high-quality, well-known, and critically acclaimed AAA or popular indie games. ` +
      `Avoid obscure titles with no ratings. ` +
      `Reply with ONLY a comma-separated list of exactly 12 video game titles similar to "${gameName}". ` +
      `No explanations, no numbering, no extra text. ` +
      `Example: Game A, Game B, Game C, Game D, Game E, Game F, Game G, Game H, Game I, Game J, Game K, Game L`;
    return this.callHf(content);
  }

  getRecommendationsByGames(gameTitles: string[]): Observable<string[]> {
    const list = gameTitles.join(', ');
    const content =
      `You are a video game recommendation engine. ` +
      `Recommend ONLY high-quality, well-known, and critically acclaimed AAA or popular indie games. ` +
      `Avoid obscure titles with no ratings. ` +
      `Based on these games: ${list}, suggest exactly 12 similar top-rated masterpieces. ` +
      `Reply with ONLY a comma-separated list of exact video game titles. ` +
      `No explanations, no numbering, no extra text. ` +
      `Example: Game A, Game B, Game C, Game D, Game E, Game F, Game G, Game H, Game I, Game J, Game K, Game L`;
    return this.callHf(content);
  }

  getPersonalizedRecommendations(genres: string[]): Observable<string[]> {
    const content =
      `You are a video game recommendation engine. ` +
      `Recommend ONLY high-quality, well-known, and critically acclaimed AAA or popular indie games. ` +
      `Avoid obscure titles with no ratings. ` +
      `Reply with ONLY a comma-separated list of exactly 12 popular video game titles ` +
      `from these genres: ${genres.join(', ')}. No explanations, no numbering, no extra text. ` +
      `Example: Game A, Game B, Game C, Game D, Game E, Game F, Game G, Game H, Game I, Game J, Game K, Game L`;
    return this.callHf(content);
  }

  private callHf(userContent: string): Observable<string[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.huggingFaceToken}`,
      'Content-Type': 'application/json'
    });
    const body = {
      model: this.model,
      messages: [{ role: 'user', content: userContent }],
      max_tokens: 150,
      stream: false
    };
    return this.http.post<ChatResponse>(this.hfUrl, body, { headers }).pipe(
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
