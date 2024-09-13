FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 as build
ARG TARGETARCH
WORKDIR /operator

COPY ./UnMango.TheCluster.Types/UnMango.TheCluster.Types.fsproj ./UnMango.TheCluster.Types/
COPY ./UnMango.TheCluster.Entities/UnMango.TheCluster.Entities.csproj ./UnMango.TheCluster.Entities/
COPY ./UnMango.TheCluster/UnMango.TheCluster.fsproj ./UnMango.TheCluster/

RUN dotnet restore \
      -a $TARGETARCH \
      UnMango.TheCluster/UnMango.TheCluster.fsproj

COPY ./UnMango.TheCluster.Types/ ./UnMango.TheCluster.Types/
COPY ./UnMango.TheCluster.Entities/ ./UnMango.TheCluster.Entities/
COPY ./UnMango.TheCluster/ ./UnMango.TheCluster/

RUN dotnet publish \
      --no-restore \
      -c Release \
      -o out \
      -a $TARGETARCH \
      UnMango.TheCluster/UnMango.TheCluster.fsproj

# The runner for the application
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/aspnet:9.0 as final

RUN addgroup k8s-operator && useradd -G k8s-operator operator-user

WORKDIR /operator
COPY --from=build /operator/out/ ./
RUN chown operator-user:k8s-operator -R .

USER operator-user

ENTRYPOINT [ "dotnet", "operator.dll" ]
