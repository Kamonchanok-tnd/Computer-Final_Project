# Step 1: Build stage
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /go/src/example

# Copy the backend code
COPY backend .

# Install necessary build dependencies
RUN apk add --no-cache build-base

# Install Go dependencies
RUN go mod tidy

# Build the Go application
RUN go build -o main .

# Step 2: Final stage
FROM alpine:latest

# Set working directory
WORKDIR /go/src/example

# Copy the built binary from the builder stage
COPY --from=builder /go/src/example/main .

# Expose port
EXPOSE 8080

# Command to run the app
CMD ["./main"]
