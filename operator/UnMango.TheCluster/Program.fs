open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open KubeOps.Operator

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)

    builder.Services
        .AddKubernetesOperator()
        .RegisterComponents()
    |> ignore

    builder.Services.AddControllers() |> ignore

    let app = builder.Build()

    app.UseRouting() |> ignore
    app.MapControllers() |> ignore
    app.Run()

    0 // Exit code
