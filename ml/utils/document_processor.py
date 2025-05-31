# Document processing utilities
import pandas as pd
from PyPDF2 import PdfFileReader
import docx
import os

def extract_from_pdf(file_path):
    """Extract text from PDF files"""
    text = ''
    with open(file_path, 'rb') as file:
        pdf_reader = PdfFileReader(file)
        for page_num in range(pdf_reader.numPages):
            text += pdf_reader.getPage(page_num).extractText()
    return text

def extract_from_docx(file_path):
    """Extract text from DOCX files"""
    doc = docx.Document(file_path)
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return '\n'.join(text)

def load_document(file_path):
    """Load data from various file formats (CSV, PDF, DOCX)"""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.csv':
        return pd.read_csv(file_path)
    elif file_extension == '.pdf':
        return extract_from_pdf(file_path)
    elif file_extension == '.docx':
        return extract_from_docx(file_path)
    else:
        raise ValueError(f'Unsupported file format: {file_extension}')
