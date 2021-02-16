FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

COPY ./service-connector-common/*.csproj ./service-connector-common/

WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ./service-connector/*.csproj ./
RUN dotnet restore

WORKDIR /
COPY ./service-connector-common ./service-connector-common/

WORKDIR /app

# Copy everything else and build
COPY ./service-connector ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "ServiceConnector.dll"]
HEALTHCHECK CMD curl --fail http://localhost:80/healthz || exit
