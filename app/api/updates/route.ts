export async function GET() {
  const xml = `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='EXTENSION_ID'>
    <updatecheck codebase='https://github.com/androdotdev/CLai/releases/latest/download/clai-extension.zip' version='1.0.1' />
  </app>
</gupdate>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml",
      "Cache-Control": "no-cache",
    },
  });
}
