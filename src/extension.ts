import * as vscode from 'vscode';
import * as path from 'path';

import { getWebViewContent } from './webview';

export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined;

	let disposable = vscode.commands.registerCommand('elevator-saga.start', () => {
		if (panel) {
			panel.reveal(vscode.ViewColumn.Two);
			return;
		}

		panel = vscode.window.createWebviewPanel(
			"elevatorSaga",
			"Elevator Saga",
			vscode.ViewColumn.Two,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(context.extensionPath, 'webview')),
				],
			},
		);

		panel.webview.html = getWebViewContent(
			path.join(context.extensionPath, 'webview'),
			(fp: string) => {
				if (!panel) {
					return "";
				}
				const localUri = vscode.Uri.file(path.join(fp));
				const vscodeUri = panel.webview.asWebviewUri(localUri).toString();
				return vscodeUri;
			},
		);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
