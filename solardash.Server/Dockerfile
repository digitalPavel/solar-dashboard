# --- Stage 1: Build the app using SDK image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy the .csproj file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy all source files and publish the project
COPY . ./
RUN dotnet publish -c Release -o /out

# --- Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /out .

# Expose port 80 to the host
EXPOSE 80

# Set the startup command
ENTRYPOINT ["dotnet", "solardash.Server.dll"]