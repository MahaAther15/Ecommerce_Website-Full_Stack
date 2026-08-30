# ==========================================
# Multi-Stage Dockerfile for ASP.NET Core (.NET 10)
# ==========================================

# Stage 1: Base Runtime Environment
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8080

# Stage 2: Build Application & Restore Dependencies (Cached Layer)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj first for Docker layer caching of dependencies
COPY ["ecommerce-backend.csproj", "./"]
RUN dotnet restore "./ecommerce-backend.csproj"

# Copy the rest of the backend source code
COPY . .
RUN dotnet build "ecommerce-backend.csproj" -c Release -o /app/build

# Stage 3: Publish optimized release build
FROM build AS publish
RUN dotnet publish "ecommerce-backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final Lean Runtime Image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Run as non-root user for security (Default in .NET 8+)
USER $APP_UID

ENTRYPOINT ["dotnet", "ecommerce-backend.dll"]
