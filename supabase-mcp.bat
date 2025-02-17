@echo off
REM Supabase MCP Server Configuration
set SUPABASE_URL=https://zmehitecfxyglfnqplcg.supabase.co/rest/v1
set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZWhpdGVjZnh5Z2xmbnFwbGNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTU1MTg5OSwiZXhwIjoyMDU1MTI3ODk5fQ.36L8MCddRgdal8XE86CPuFFt5XmyKSff6l5fRvfbHSw

REM Install the package if not already installed
call npm install -g @supabase/mcp-server-postgrest

REM Run the MCP server
call npx @supabase/mcp-server-postgrest --apiUrl %SUPABASE_URL% --apiKey %SUPABASE_KEY% --schema public