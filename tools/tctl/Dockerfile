#syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0-jammy as build
ARG TARGETARCH

WORKDIR /src
COPY tools/tctl/UnMango.TheCluster.CLI/*.fsproj ./
RUN dotnet restore -a $TARGETARCH
COPY tools/tctl/UnMango.TheCluster.CLI/* ./
ENV MinVerSkip=true
RUN dotnet publish -a $TARGETARCH -c Release --no-restore -o /out

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0-jammy as test
WORKDIR /test
COPY --from=build /out .
COPY tools/tctl/spec/e2e.sh .
ENV DOCKER_SENTINEL=true
RUN ./e2e.sh

# I guess we need aspnet because Pulumi depends on it...
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/aspnet:8.0-jammy-chiseled as final
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT [ "dotnet", "UnMango.TheCluster.CLI.dll" ]
