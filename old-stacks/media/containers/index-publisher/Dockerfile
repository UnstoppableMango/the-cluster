FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

COPY ./service-connector-common/*.csproj ./service-connector-common/
COPY ./service-connector-client/*.csproj ./service-connector-client/

WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ./index-publisher/*.csproj ./
RUN dotnet restore

WORKDIR /
COPY ./service-connector-common ./service-connector-common/
COPY ./service-connector-client ./service-connector-client/

WORKDIR /app

# Copy everything else and build
COPY ./index-publisher ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "IndexPublisher.dll"]
