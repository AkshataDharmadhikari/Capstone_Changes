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
 
  // Store selected files here as an array
  selectedFiles: File[] | null = null;
 
  ngOnInit() {
    this.loadUserDocuments();
  }
 
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
 
  onFileSelected(event: any) {
    // Convert FileList to array
    this.selectedFiles = Array.from(event.target.files);
  }
 
  uploadFiles() {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.uploadMessage = 'Please select PDF(s) to upload.';
      return;
    }
 
    const token = localStorage.getItem('token');
    if (!token) {
      this.uploadMessage = 'Please login first';
      this.router.navigateByUrl('/login');
      return;
    }
 
    const formData = new FormData();
    for (const file of this.selectedFiles) {
      formData.append('files', file, file.name);
    }
 
    const headers = new HttpHeaders().set('x-auth-token', token);
 
    this.http.post('http://localhost:4000/api/upload', formData, { headers }).subscribe({
      next: (res: any) => {
        this.uploadMessage = 'PDF(s) uploaded successfully!';
        this.loadUserDocuments();
        this.selectedFiles = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
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
 
  // Method to convert FileList to an array
  getSelectedFilesArray(): File[] {
    return this.selectedFiles ? this.selectedFiles : [];
  }
}
 