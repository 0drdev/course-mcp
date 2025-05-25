# Guion del Curso: Model Context Protocol (MCP)

## Información del Curso
- **Duración estimada**: 3-4 horas
- **Nivel**: Intermedio-Avanzado
- **Audiencia**: Desarrolladores, ingenieros de IA, arquitectos de sistemas

---

## Módulo 1: Introducción al Model Context Protocol (30 minutos)

### 1.1 Bienvenida y Objetivos del Curso (5 min)
**Presentador dice:**
"Bienvenidos al curso sobre Model Context Protocol. Al finalizar este curso, ustedes podrán:
- Comprender qué es MCP y por qué es importante
- Implementar servicios MCP básicos
- Integrar MCP en aplicaciones existentes
- Resolver problemas comunes de implementación"

### 1.2 ¿Qué es el Model Context Protocol? (10 min)
**Presentador explica:**
"El Model Context Protocol es un estándar abierto que permite a los modelos de IA acceder a datos y herramientas externas de forma segura y estructurada.

**Conceptos clave:**
- **Protocolo estandarizado**: Comunicación uniforme entre modelos y recursos externos
- **Seguridad por diseño**: Control granular de permisos y acceso
- **Extensibilidad**: Fácil integración de nuevas fuentes de datos y herramientas"

**Mostrar diagrama en pantalla:**
```
[Modelo de IA] ←→ [MCP Server] ←→ [Recursos Externos]
                    (APIs, Bases de datos, Herramientas)
```

### 1.3 Casos de Uso Comunes (10 min)
**Presentador presenta ejemplos:**
1. **Acceso a bases de datos**: Consultas SQL dinámicas
2. **Integración con APIs**: Servicios web, REST APIs
3. **Herramientas de desarrollo**: Git, sistemas de archivos
4. **Análisis de datos**: Procesamiento de datasets grandes

### 1.4 Arquitectura General (5 min)
**Componentes principales:**
- **MCP Client**: El modelo de IA o aplicación cliente
- **MCP Server**: Servidor que expone recursos y herramientas
- **Transport Layer**: Comunicación (JSON-RPC, HTTP, WebSockets)
- **Resource Providers**: Fuentes de datos específicas

---

## Módulo 2: Componentes y Arquitectura (45 minutos)

### 2.1 Anatomía de un MCP Server (15 min)
**Presentador codifica en vivo:**
```python
from mcp import Server, types

# Crear servidor MCP básico
server = Server("mi-servidor-mcp")

@server.list_resources()
async def list_resources() -> list[types.Resource]:
    """Lista los recursos disponibles"""
    return [
        types.Resource(
            uri="file://documents/",
            name="Documentos",
            description="Acceso a documentos del sistema"
        )
    ]
```

**Explicar cada parte:**
- Declaración del servidor
- Decoradores para funcionalidades
- Tipos de datos estándar

### 2.2 Manejo de Recursos (15 min)
**Demostración práctica:**
```python
@server.read_resource()
async def read_resource(uri: str) -> str:
    """Lee un recurso específico"""
    if uri.startswith("file://documents/"):
        file_path = uri.replace("file://documents/", "")
        with open(file_path, 'r') as f:
            return f.read()
    raise ValueError(f"Recurso no encontrado: {uri}")
```

**Puntos importantes:**
- Validación de URIs
- Manejo de errores
- Seguridad en el acceso a archivos

### 2.3 Implementación de Herramientas (15 min)
**Ejemplo de herramienta personalizada:**
```python
@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="calculadora",
            description="Realiza cálculos matemáticos",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {"type": "string"}
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "calculadora":
        expression = arguments.get("expression")
        result = eval(expression)  # ⚠️ Solo para demo
        return {"result": result}
```

---

## Módulo 3: Implementación Práctica (60 minutos)

### 3.1 Configuración del Entorno (10 min)
**Presentador guía la instalación:**
```bash
# Instalación de dependencias
pip install mcp-server
npm install @modelcontextprotocol/client

# Verificar instalación
mcp --version
```

### 3.2 Primer Servidor MCP (20 min)
**Ejercicio práctico guiado:**
"Vamos a crear un servidor MCP que gestione una lista de tareas."

```python
# todo_server.py
import asyncio
from mcp import Server, types

# Base de datos en memoria
tasks = []

server = Server("todo-mcp-server")

@server.list_resources()
async def list_resources():
    return [
        types.Resource(
            uri="todo://tasks",
            name="Lista de Tareas",
            description="Gestión de tareas pendientes"
        )
    ]

@server.read_resource()
async def read_resource(uri: str):
    if uri == "todo://tasks":
        return "\n".join([f"- {task}" for task in tasks])
    raise ValueError("Recurso no encontrado")

@server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="add_task",
            description="Añade una nueva tarea",
            inputSchema={
                "type": "object",
                "properties": {
                    "task": {"type": "string"}
                },
                "required": ["task"]
            }
        ),
        types.Tool(
            name="complete_task",
            description="Marca una tarea como completada",
            inputSchema={
                "type": "object",
                "properties": {
                    "index": {"type": "integer"}
                },
                "required": ["index"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "add_task":
        task = arguments["task"]
        tasks.append(task)
        return {"status": "success", "message": f"Tarea '{task}' añadida"}
    
    elif name == "complete_task":
        index = arguments["index"]
        if 0 <= index < len(tasks):
            completed_task = tasks.pop(index)
            return {"status": "success", "message": f"Tarea '{completed_task}' completada"}
        else:
            return {"status": "error", "message": "Índice inválido"}

if __name__ == "__main__":
    asyncio.run(server.run())
```

### 3.3 Cliente MCP (15 min)
**Demostración de cliente:**
```python
# client.py
import asyncio
from mcp import Client

async def main():
    client = Client("http://localhost:8000")
    
    # Conectar al servidor
    await client.connect()
    
    # Listar recursos disponibles
    resources = await client.list_resources()
    print("Recursos:", resources)
    
    # Usar herramientas
    result = await client.call_tool("add_task", {"task": "Aprender MCP"})
    print("Resultado:", result)
    
    # Leer recursos
    tasks_content = await client.read_resource("todo://tasks")
    print("Tareas actuales:", tasks_content)

if __name__ == "__main__":
    asyncio.run(main())
```

### 3.4 Pruebas y Debugging (15 min)
**Herramientas de desarrollo:**
```bash
# Ejecutar en modo debug
mcp-server --debug todo_server.py

# Inspeccionar comunicación
mcp-inspector --server=http://localhost:8000

# Validar esquemas
mcp-validate schema.json
```

---

## Módulo 4: Casos de Uso Avanzados (45 minutos)

### 4.1 Integración con Bases de Datos (15 min)
**Ejemplo con SQLite:**
```python
import sqlite3
from mcp import Server, types

server = Server("database-mcp")

@server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="sql_query",
            description="Ejecuta consultas SQL",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "params": {"type": "array"}
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "sql_query":
        query = arguments["query"]
        params = arguments.get("params", [])
        
        # Validación de seguridad
        if not query.upper().startswith("SELECT"):
            return {"error": "Solo consultas SELECT permitidas"}
        
        conn = sqlite3.connect("database.db")
        cursor = conn.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        
        return {"results": results}
```

### 4.2 APIs Externas (15 min)
**Integración con servicios web:**
```python
import aiohttp
from mcp import Server, types

server = Server("api-mcp")

@server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="weather_info",
            description="Obtiene información del clima",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "weather_info":
        city = arguments["city"]
        
        async with aiohttp.ClientSession() as session:
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {"q": city, "appid": "API_KEY"}
            
            async with session.get(url, params=params) as response:
                data = await response.json()
                return {
                    "temperature": data["main"]["temp"],
                    "description": data["weather"][0]["description"]
                }
```

### 4.3 Manejo de Archivos y Sistema (15 min)
**Operaciones del sistema de archivos:**
```python
import os
import aiofiles
from mcp import Server, types

server = Server("filesystem-mcp")

@server.list_resources()
async def list_resources():
    return [
        types.Resource(
            uri="file://workspace/",
            name="Espacio de Trabajo",
            description="Archivos del proyecto"
        )
    ]

@server.read_resource()
async def read_resource(uri: str):
    if uri.startswith("file://workspace/"):
        file_path = uri.replace("file://workspace/", "./workspace/")
        
        # Validación de seguridad
        if not os.path.abspath(file_path).startswith(os.path.abspath("./workspace/")):
            raise ValueError("Acceso denegado")
        
        async with aiofiles.open(file_path, 'r') as f:
            content = await f.read()
        return content
```

---

## Módulo 5: Seguridad y Mejores Prácticas (30 minutos)

### 5.1 Principios de Seguridad (10 min)
**Presentador enfatiza:**
"La seguridad en MCP es crítica. Principios fundamentales:

1. **Principio de menor privilegio**: Solo permisos necesarios
2. **Validación de entrada**: Siempre validar datos de entrada
3. **Sanitización**: Limpiar datos antes de procesarlos
4. **Auditoría**: Registrar todas las operaciones"

### 5.2 Implementación de Seguridad (10 min)
**Ejemplos de código seguro:**
```python
import re
from pathlib import Path

def validate_file_path(file_path: str, allowed_directory: str) -> bool:
    """Valida que el archivo esté en el directorio permitido"""
    try:
        resolved_path = Path(file_path).resolve()
        allowed_path = Path(allowed_directory).resolve()
        return resolved_path.is_relative_to(allowed_path)
    except:
        return False

def sanitize_sql_query(query: str) -> bool:
    """Verifica que la consulta SQL sea segura"""
    dangerous_keywords = ["DROP", "DELETE", "UPDATE", "INSERT", "CREATE", "ALTER"]
    query_upper = query.upper()
    return not any(keyword in query_upper for keyword in dangerous_keywords)
```

### 5.3 Manejo de Errores (10 min)
**Estrategias de error handling:**
```python
from mcp import types
import logging

logger = logging.getLogger(__name__)

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    try:
        # Lógica de la herramienta
        result = await process_tool(name, arguments)
        return result
        
    except ValueError as e:
        logger.warning(f"Error de validación: {e}")
        return types.ErrorResult(
            error="VALIDATION_ERROR",
            message="Datos de entrada inválidos"
        )
        
    except PermissionError as e:
        logger.error(f"Error de permisos: {e}")
        return types.ErrorResult(
            error="PERMISSION_DENIED",
            message="Acceso no autorizado"
        )
        
    except Exception as e:
        logger.error(f"Error interno: {e}")
        return types.ErrorResult(
            error="INTERNAL_ERROR",
            message="Error interno del servidor"
        )
```

---

## Módulo 6: Deployment y Monitoreo (30 minutos)

### 6.1 Configuración de Producción (10 min)
**Docker deployment:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "-m", "mcp.server", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mcp-server:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MCP_LOG_LEVEL=INFO
    volumes:
      - ./data:/app/data
```

### 6.2 Monitoreo y Logging (10 min)
**Configuración de logging:**
```python
import logging
from mcp import Server

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

server = Server("monitored-mcp")

@server.middleware
async def logging_middleware(request, handler):
    start_time = time.time()
    logger.info(f"Request: {request.method} {request.uri}")
    
    try:
        response = await handler(request)
        duration = time.time() - start_time
        logger.info(f"Response: {response.status} ({duration:.3f}s)")
        return response
    except Exception as e:
        logger.error(f"Error: {e}")
        raise
```

### 6.3 Escalabilidad (10 min)
**Consideraciones de escalabilidad:**
- Load balancing múltiples instancias MCP
- Caching de recursos frecuentemente accedidos
- Rate limiting para prevenir abuso
- Métricas de performance

---

## Módulo 7: Ejercicio Práctico Final (45 minutos)

### 7.1 Planteamiento del Problema (5 min)
**Presentador explica:**
"Vamos a construir un sistema MCP completo para gestión de un blog:
- Leer y escribir posts
- Gestionar comentarios
- Búsqueda de contenido
- Estadísticas básicas"

### 7.2 Desarrollo Guiado (30 min)
**Implementación paso a paso:**
```python
# blog_mcp_server.py
import json
import asyncio
from datetime import datetime
from mcp import Server, types

class BlogMCP:
    def __init__(self):
        self.posts = []
        self.comments = {}
        
    def add_post(self, title: str, content: str, author: str):
        post_id = len(self.posts)
        post = {
            "id": post_id,
            "title": title,
            "content": content,
            "author": author,
            "created_at": datetime.now().isoformat(),
            "views": 0
        }
        self.posts.append(post)
        return post_id
        
    def get_post(self, post_id: int):
        if 0 <= post_id < len(self.posts):
            self.posts[post_id]["views"] += 1
            return self.posts[post_id]
        return None

blog = BlogMCP()
server = Server("blog-mcp")

@server.list_resources()
async def list_resources():
    return [
        types.Resource(
            uri="blog://posts",
            name="Posts del Blog",
            description="Todos los posts publicados"
        ),
        types.Resource(
            uri="blog://stats",
            name="Estadísticas",
            description="Estadísticas de uso del blog"
        )
    ]

@server.read_resource()
async def read_resource(uri: str):
    if uri == "blog://posts":
        return json.dumps(blog.posts, indent=2)
    elif uri == "blog://stats":
        total_posts = len(blog.posts)
        total_views = sum(post["views"] for post in blog.posts)
        return json.dumps({
            "total_posts": total_posts,
            "total_views": total_views,
            "average_views": total_views / max(total_posts, 1)
        }, indent=2)

@server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="create_post",
            description="Crea un nuevo post",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "content": {"type": "string"},
                    "author": {"type": "string"}
                },
                "required": ["title", "content", "author"]
            }
        ),
        types.Tool(
            name="search_posts",
            description="Busca posts por término",
            inputSchema={
                "type": "object",
                "properties": {
                    "term": {"type": "string"}
                },
                "required": ["term"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "create_post":
        post_id = blog.add_post(
            arguments["title"],
            arguments["content"],
            arguments["author"]
        )
        return {"status": "success", "post_id": post_id}
        
    elif name == "search_posts":
        term = arguments["term"].lower()
        matching_posts = [
            post for post in blog.posts
            if term in post["title"].lower() or term in post["content"].lower()
        ]
        return {"results": matching_posts, "count": len(matching_posts)}

if __name__ == "__main__":
    asyncio.run(server.run())
```

### 7.3 Testing y Refinamiento (10 min)
**Cliente de prueba:**
```python
# test_blog_client.py
import asyncio
from mcp import Client

async def test_blog_mcp():
    client = Client("http://localhost:8000")
    await client.connect()
    
    # Crear algunos posts de prueba
    await client.call_tool("create_post", {
        "title": "Introducción a MCP",
        "content": "MCP es un protocolo revolucionario...",
        "author": "Juan Pérez"
    })
    
    await client.call_tool("create_post", {
        "title": "Guía Avanzada de MCP",
        "content": "En esta guía veremos casos avanzados...",
        "author": "María García"
    })
    
    # Buscar posts
    results = await client.call_tool("search_posts", {"term": "MCP"})
    print("Resultados de búsqueda:", results)
    
    # Ver estadísticas
    stats = await client.read_resource("blog://stats")
    print("Estadísticas:", stats)

if __name__ == "__main__":
    asyncio.run(test_blog_mcp())
```

---

## Módulo 8: Recursos y Próximos Pasos (15 minutos)

### 8.1 Recursos Adicionales (5 min)
**Presentador comparte:**
- Documentación oficial de MCP
- Repositorios de ejemplo en GitHub
- Comunidad y foros de discusión
- Herramientas de desarrollo adicionales

### 8.2 Roadmap y Evolución (5 min)
**Tendencias futuras:**
- Integración con más modelos de IA
- Estándares de seguridad mejorados
- Herramientas de debugging avanzadas
- Ecosistema de plugins expandido

### 8.3 Ejercicios para Practicar (5 min)
**Proyectos sugeridos:**
1. **MCP para redes sociales**: Integración con APIs de Twitter, LinkedIn
2. **MCP de análisis de datos**: Pandas, NumPy, visualizaciones
3. **MCP de DevOps**: Git, Docker, CI/CD pipelines
4. **MCP de e-commerce**: Gestión de productos, pedidos, inventario

---

## Evaluación y Cierre

### Preguntas de Evaluación
1. ¿Cuáles son los componentes principales de la arquitectura MCP?
2. ¿Cómo implementarías validación de seguridad en un servidor MCP?
3. ¿Qué consideraciones de escalabilidad tendrías en cuenta?
4. Diseña un servidor MCP para tu caso de uso específico

### Certificación
- Completar ejercicio práctico final
- Enviar proyecto personal usando MCP
- Quiz de conocimientos técnicos

---

## Notas para el Presentador

### Preparación Técnica
- [ ] Verificar que todas las dependencias estén instaladas
- [ ] Preparar entorno de demostración
- [ ] Tener ejemplos de código listos para copiar/pegar
- [ ] Configurar herramientas de debugging

### Consejos de Presentación
- Alternar entre teoría y práctica cada 15 minutos
- Permitir preguntas al final de cada módulo
- Usar ejemplos del mundo real
- Demostrar errores comunes y cómo solucionarlos

### Materiales Adicionales
- Slides con diagramas de arquitectura
- Cheat sheet de comandos MCP
- Lista de recursos y referencias
- Plantillas de código para diferentes casos de uso

---

*Fin del Guion - Duración Total: 3.5 horas*