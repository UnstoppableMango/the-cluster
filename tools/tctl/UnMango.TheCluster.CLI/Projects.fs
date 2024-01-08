module UnMango.TheCluster.CLI.Projects

open System.IO
open System.Reflection
open Fluid

module private Templates =
    let parser = FluidParser()
    let executingAssembly = lazy Assembly.GetExecutingAssembly()

    // yucc
    let template m t =
        let suc, tmpl, err = parser.TryParse t

        if suc then
            tmpl.Render(TemplateContext(m, true))
        else
            failwithf $"Error: %s{err}"

    let templateAll m = Seq.map (template m)

    let readResource: string -> string =
        let readStream (stream: Stream) =
            use reader = new StreamReader(stream)
            reader.ReadToEnd()

        executingAssembly.Value.GetManifestResourceStream >> readStream

    let readResources: string seq -> string seq = Seq.map readResource
    let templateResource m = readResource >> template m
    let templateResources m = Seq.map (templateResource m)

    let all = executingAssembly.Value.GetManifestResourceNames() :> string seq

module Ts =
    let files = [ "Chart.yaml"; "config.ts"; "index.ts"; "oauth.ts"; "package.json" ]

    let template m =
        files
        |> Seq.map (fun x -> $"UnMango.TheCluster.CLI.templates.typescript.${x}")
        |> Templates.templateResources m

module Fs =
    let files = [ "Name.fsproj" ]

    let template m =
        files
        |> Seq.map (fun x -> $"UnMango.TheCluster.CLI.templates.fsharp.${x}")
        |> Templates.templateResources m
