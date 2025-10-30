import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import type {
  BreakdownOptions,
  DiffOptions,
  OutputOptions,
  UploadOptions,
  CommentOptions,
  CommandResult,
} from './types.js';

const execFileAsync = promisify(execFile);

export async function checkInfracostInstalled(): Promise<boolean> {
  try {
    await execFileAsync('infracost', ['--version']);
    return true;
  } catch {
    return false;
  }
}

export async function executeBreakdown(options: BreakdownOptions): Promise<CommandResult> {
  try {
    const args = ['breakdown', '--path', resolve(options.path)];

    if (options.format) {
      args.push('--format', options.format);
    }

    if (options.outFile) {
      args.push('--out-file', resolve(options.outFile));
    }

    if (options.terraformVarFile) {
      options.terraformVarFile.forEach((file) => {
        args.push('--terraform-var-file', resolve(file));
      });
    }

    if (options.terraformVar) {
      Object.entries(options.terraformVar).forEach(([key, value]) => {
        args.push('--terraform-var', `${key}=${value}`);
      });
    }

    const { stdout, stderr } = await execFileAsync('infracost', args, {
      maxBuffer: 10 * 1024 * 1024,
    });

    let parsedData;
    if (options.format === 'json' && !options.outFile && stdout.trim()) {
      try {
        parsedData = JSON.parse(stdout);
      } catch (e) {
        // If parsing fails, leave data undefined
      }
    }

    return {
      success: true,
      output: options.outFile ? `Output saved to ${options.outFile}` : stdout,
      error: stderr || undefined,
      data: parsedData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function executeDiff(options: DiffOptions): Promise<CommandResult> {
  try {
    const args = ['diff', '--path', resolve(options.path), '--compare-to', resolve(options.compareTo)];

    if (options.format) {
      args.push('--format', options.format);
    }

    if (options.outFile) {
      args.push('--out-file', resolve(options.outFile));
    }

    const { stdout, stderr } = await execFileAsync('infracost', args, {
      maxBuffer: 10 * 1024 * 1024,
    });

    let parsedData;
    if (options.format === 'json' && !options.outFile && stdout.trim()) {
      try {
        parsedData = JSON.parse(stdout);
      } catch (e) {}
    }

    return {
      success: true,
      output: options.outFile ? `Output saved to ${options.outFile}` : stdout,
      error: stderr || undefined,
      data: parsedData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function executeOutput(options: OutputOptions): Promise<CommandResult> {
  try {
    const args = ['output', '--path', resolve(options.path)];

    if (options.format) {
      args.push('--format', options.format);
    }

    if (options.outFile) {
      args.push('--out-file', resolve(options.outFile));
    }

    if (options.fields && options.fields.length > 0) {
      args.push('--fields', options.fields.join(','));
    }

    if (options.showSkipped) {
      args.push('--show-skipped');
    }

    const { stdout, stderr } = await execFileAsync('infracost', args, {
      maxBuffer: 10 * 1024 * 1024,
    });

    let parsedData;
    if (options.format === 'json' && !options.outFile && stdout.trim()) {
      try {
        parsedData = JSON.parse(stdout);
      } catch (e) {}
    }

    return {
      success: true,
      output: options.outFile ? `Output saved to ${options.outFile}` : stdout,
      error: stderr || undefined,
      data: parsedData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function executeUpload(options: UploadOptions): Promise<CommandResult> {
  try {
    const args = ['upload', '--path', resolve(options.path)];

    const { stdout, stderr } = await execFileAsync('infracost', args, {
      maxBuffer: 10 * 1024 * 1024,
    });

    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function executeComment(options: CommentOptions): Promise<CommandResult> {
  try {
    const args = ['comment', options.platform, '--path', resolve(options.path)];

    if (options.repo) {
      args.push('--repo', options.repo);
    }

    if (options.pullRequest) {
      args.push('--pull-request', options.pullRequest);
    }

    if (options.commit) {
      args.push('--commit', options.commit);
    }

    if (options.tag) {
      args.push('--tag', options.tag);
    }

    if (options.behavior) {
      args.push('--behavior', options.behavior);
    }

    const { stdout, stderr } = await execFileAsync('infracost', args, {
      maxBuffer: 10 * 1024 * 1024,
    });

    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
