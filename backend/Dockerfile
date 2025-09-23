# Step 1: Build stage
FROM golang:1.21-alpine AS builder

# Install build tools
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first to cache deps
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy rest of the backend source
COPY backend .

# Build the Go app
RUN go build -o main .

# Step 2: Final stage
FROM alpine:latest

# Set working directory
WORKDIR /app

# Copy binary from build stage
COPY --from=builder /app/main .

# Expose port (update if your backend uses a different port)
EXPOSE 8080

# Command to run the app
CMD ["./main"]
