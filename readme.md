# Rethink Journalism 2022 Hackathon

> Hacking Robots

Um Kosten zu sparen, hat Bajour seit einigen Wochen einen Schreib-Roboter von [Scribit](https://scribit.design/). Er kann an Wände und Fenster schreiben und es ist ein bisschen wie Magie.

Wenn man die korrekten Bilder hochlädt (Vektorformat in der genau richtigen Auflösung), dann macht er alles, was man will. Doch wäre es möglich, dass er die Kommandos von der Wepublish-Api zur Frage des Tages erhält und für jede Stimme ein Strichli macht?

## How it works

Scribit allows you to upload an svg to their web app which you then can print by sending the command on your mobile phone.

We hook into the WePublish API and generate a SVG image according to what Scribit wants. Unfortunately Scribit does not provide an API so we use puppeteer to emulate a user uploading an image manually.

What is yet to be solved is the automatic drawing via the mobile phone app as this is currently a manual step. This means that the initiating of printing the image has also to be done manually as missing a print could lead to votes not being printed.

## Install

```bash
npm install
cp .env.example .env
```

Update the values in .env for Scribit login data and the public api endpoint for WePublish.

Tested with Node 18.x

## Starting

```bash
npx nx serve hackathon
```

and then navigate your browser to `http://localhost:3333/<article-id>`. This will generate the image and upload it to scribit.

After this is done, you will have to start the printing on your phone via the scribit app.

## Things issing

1. Incremental image building
2. Deleting already drawn images
3. Automatically print the image
4. Better interface for initiating what poll should be taken

## License

Whatever the hackathon is using, or MIT.
