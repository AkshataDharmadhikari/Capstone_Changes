// src/app/home/home.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  private router = inject(Router);
  private http = inject(HttpClient);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  uploadedFiles: Array<{ originalName: string; path: string }> = [];
  uploadMessage = '';

  ngOnInit() {
    this.loadUserDocuments();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.uploadMessage = 'Please login first';
      this.router.navigateByUrl('/login');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }

    const headers = new HttpHeaders().set('x-auth-token', token);

    this.http.post('http://localhost:4000/api/upload', formData, { headers }).subscribe({
      next: (res: any) => {
        this.uploadMessage = 'PDF(s) uploaded successfully!';
        // refresh list
        this.uploadedFiles = res.documents || [];
      },
      error: (err) => {
        this.uploadMessage = err?.error?.message || 'Error uploading PDF(s).';
        console.error('Upload error', err);
      }
    });
  }

  loadUserDocuments() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('x-auth-token', token);
    this.http.get('http://localhost:4000/api/upload', { headers }).subscribe({
      next: (res: any) => {
        this.uploadedFiles = res.documents || [];
      },
      error: (err) => {
        console.error('Could not load documents', err);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigateByUrl('/login');
  }
}
