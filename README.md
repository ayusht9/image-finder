# Image Finder

Image Finder is a React-based tool that processes images and performs document-style searches to locate specific words. It extracts text and spatial coordinates from images, allowing users to highlight and find the exact locations of matched search terms.

## Features

- **Image Upload:** Upload images directly to the application.
- **Word Search:** Search for specific words within the extracted text.
- **Visual Highlighting:** Highlights the bounding boxes of the matched words on the image.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

### Docker Setup

You can also run the application using Docker. A multi-stage Dockerfile and a `docker-compose.yml` are provided for both development and production environments.

#### Development with Docker Compose (Hot-Reloading)

To start the development server with hot-reloading enabled:

```bash
docker-compose up --build
```
The app will be available at `http://localhost:5173`.

#### Production Build with Docker

To build and run the optimized production image:

1. Build the Docker image:
   ```bash
   docker build --target production -t image-finder:prod .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8080:80 image-finder:prod
   ```
The app will be available at `http://localhost:8080`.

## Tech Stack

- React 19
- TypeScript
- Vite
- Docker
