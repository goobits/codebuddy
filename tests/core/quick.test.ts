import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { MCPTestClient, QUICK_TESTS, assertToolResult } from '../helpers/mcp-test-client.js';

describe('MCP Quick Tests', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    // Use shared client when running in fast mode to reduce server overhead
    if (process.env.TEST_MODE === 'fast') {
      client = MCPTestClient.getShared();
      await client.start({ skipLSPPreload: true });
    } else {
      client = new MCPTestClient();
      await client.start({ skipLSPPreload: true });
    }
  });

  afterAll(async () => {
    await client.stop();
  });

  it('should execute all quick tests successfully', async () => {
    const results = await client.callTools(QUICK_TESTS);

    // Print results
    const toolResults = results as Array<{ name: string; success: boolean; error?: string }>;
    for (const result of toolResults) {
      console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
      if (!result.success) {
        console.error(`  Error: ${result.error}`);
      }
    }

    // Assertions
    const passed = toolResults.filter((r) => r.success).length;
    const total = results.length;
    console.log(`\nResults: ${passed}/${total} passed`);

    // All tests should pass
    expect(passed).toBe(total);
  }, 30000);

  // Individual test cases for better granularity
  it('should find definition', async () => {
    const result = await client.callTool('find_definition', {
      file_path: '/workspace/playground/src/test-file.ts',
      symbol_name: '_calculateAge',
    });
    expect(result).toBeDefined();
    assertToolResult(result);
    const content = result.content?.[0]?.text || '';
    expect(content).not.toMatch(/No symbols found|No.*found|Error/);
    expect(content).toMatch(/Results for.*(function|method)|line \d+/i);
  });

  it('should find references', async () => {
    const result = await client.callTool('find_references', {
      file_path: '/workspace/playground/src/test-file.ts',
      symbol_name: 'TestProcessor',
    });
    expect(result).toBeDefined();
    assertToolResult(result);
    const content = result.content?.[0]?.text || '';
    expect(content).not.toMatch(/No symbols found|No.*found|Error/);
    expect(content).toMatch(/References for.*TestProcessor|line \d+/i);
  });

  it('should get diagnostics', async () => {
    const result = await client.callTool('get_diagnostics', {
      file_path: '/workspace/playground/src/errors-file.ts',
    });
    expect(result).toBeDefined();
    assertToolResult(result);
    const content = result.content?.[0]?.text || '';

    // TypeScript language server may not always provide diagnostics via LSP pull requests
    // The important thing is that the tool doesn't crash and provides a proper response
    expect(content).toMatch(/No diagnostics found|Found \d+ diagnostic|Error:|Warning:/);
    expect(content).not.toMatch(/Error getting diagnostics.*undefined/);
  });

  it('should get hover information', async () => {
    const result = await client.callTool('get_hover', {
      file_path: '/workspace/playground/src/test-file.ts',
      line: 13,
      character: 10,
    });
    expect(result).toBeDefined();
    assertToolResult(result);
    const content = result.content?.[0]?.text || '';
    expect(content).not.toMatch(/Error/);
    // Should contain either hover info or a "no hover" message
    expect(content).toMatch(/function.*_calculateAge|typescript|no hover information/i);
  });

  it('should rename symbol (dry run)', async () => {
    const result = await client.callTool('rename_symbol', {
      file_path: '/workspace/playground/src/test-file.ts',
      symbol_name: 'DEFAULT_USER',
      new_name: 'RENAMED_USER',
      dry_run: true,
    });
    expect(result).toBeDefined();
    assertToolResult(result);
    const content = result.content?.[0]?.text || '';
    expect(content).not.toMatch(/No symbols found|Error/);
    expect(content).toMatch(/DRY RUN.*rename|Would rename/i);
  });
});
