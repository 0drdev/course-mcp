import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Crear el servidor
// Es la interfaz principal con el protocolo MCP. Maneja la comunicación entre el cliente y el servidor.

const server = new McpServer({
  name: "DemoMcP",
  version: "1.0.0",
});

// 2. Deinir las herramientas
// Las herramientas le permite al LLM reaizar acciones a traves de tu servidor.

// El servidor tiene varios metodos:
// propmt: Puede hacerte preguntas que pueden ser reutilizables
// resource: pueden ser de lectura de que si quiere devolver la configuracion,
// devolver una cosa en concreto

server.tool(
  "fetch-weather", // Titulo de la herramienta
  "Tool to fetch the weather of a city", // Descripcion de la herramienta
  {
    city: z.string().describe("City name"),
  },
  async ({ city }) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=es&format=json`
    );
    const data = await response.json();

    if (data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No se encontró información para la ciudad ${city}`,
          },
        ],
      };
    }

    const { latitude, longitude } = data.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,precipitation,is_day,rain&forecast_days=1`
    );

    const weatherData = await weatherResponse.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  }
);

// 3. Escuchas las conexiones del cliente
const tranport = new StdioServerTransport();
await server.connect(tranport);
