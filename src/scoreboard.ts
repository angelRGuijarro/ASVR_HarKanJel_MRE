/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor, Vector3 } from '@microsoft/mixed-reality-extension-sdk';
import { ExecException, ExecOptions } from 'child_process';
import { debug, log } from 'console';

export default class Scoreboard {
	private assets: MRE.AssetContainer;	
	private actors: Actor;
	private scoreboardActor: MRE.Actor;
	private score: number;

	/**
	 * Constructs a new instance of this class.
	 * @param context The MRE SDK context.
	 * @param baseUrl The baseUrl to this project's `./public` folder.
	 */
	constructor(private context: MRE.Context) {
		this.assets = new MRE.AssetContainer(context);
		this.actors = MRE.Actor.Create(this.context);
		// Hook the context events we're interested in.
		this.context.onStarted(() => this.started());		
		this.resetScore();
	}

	/**
	 * Called when application session starts up.
	 */
	private started() {
		this.showMenu();
		this.createBoard(new Vector3(0.7,1,0.01));
	}

	/**
	 * Show a menu for this app.
	 * Buttons to decrement, reset to cero and increment the score.
	 * */
	private showMenu() {
		// Create a parent object for all the menu items.
		//const menu = MRE.Actor.Create(this.context, {});
		//buttons possition on axis X		

		
		const buttonDec = this.createMenuButton('dec', -0.2, '-1', 0.1);
		buttonDec.setBehavior(MRE.ButtonBehavior).onClick(user => this.decrementScore());
		const buttonReset = this.createMenuButton('reset', 0, '0', 0.1);
		buttonReset.setBehavior(MRE.ButtonBehavior).onClick(user => this.resetScore());
		const buttonInc = this.createMenuButton('inc', 0.2, '+1', 0.1);
		buttonInc.setBehavior(MRE.ButtonBehavior).onClick(user => this.incrementScore());
	}

	private createBoard(boardSize: MRE.Vector3) {
		//Mesh for scoreboard
		const boardMesh = this.assets.createBoxMesh('board', boardSize.x, boardSize.y, boardSize.z);

		const boardPos = new MRE.Vector3(0, boardSize.y, 0);
		const boarScoredPos = new MRE.Vector3(0, 0,-0.01);

		//this.scoreboardActor = MRE.Actor.Create(this.context,
		const board = MRE.Actor.Create(this.context,
			{
				actor: {
					parentId: this.actors.id,
					name: 'board',
					appearance: { meshId: boardMesh.id },
					collider: { geometry: { shape: MRE.ColliderType.Auto } },
					transform: {
						local: { position: boardPos }
					}
				}
			});
		
		MRE.Actor.Create(this.context,
			{
				actor: {
					//parentId: this.scoreboardActor.id,
					parentId: board.id,
					name: 'score',
					text: {
						contents: this.score.toString(),
						height: boardSize.y * 0.5,
						anchor: MRE.TextAnchorLocation.MiddleCenter
					},
					transform: {
						local: { position: boarScoredPos }
					}
				}
			});

		
	}

	private createMenuButton(name: string, posX: number, label: string, textHeight: number): Actor {
		//Mesh for buttons
		const buttonMesh = this.assets.createBoxMesh('button' + name, 0.1, 0.1, 0.01);

		const buttonPos = new MRE.Vector3(posX, 0, 0);
		const labelPos = new MRE.Vector3(0, 0, -0.01);

		//Decrement
		const button = MRE.Actor.Create(this.context,
			{
				actor: {
					parentId: this.actors.id,
					name: 'button_' + name,
					appearance: { meshId: buttonMesh.id },
					collider: { geometry: { shape: MRE.ColliderType.Auto } },
					transform: {
						local: { position: buttonPos }
					}
				}
			});
		//click handler for this button
		//button.setBehavior(MRE.ButtonBehavior).onClick(user => this.decrementScore());
		
		// Create a label for the button.
		MRE.Actor.Create(this.context,
			{
				actor: {
					parentId: button.id,
					name: 'label_' + name,
					text: {
						contents: label,
						height: textHeight,
						anchor: MRE.TextAnchorLocation.MiddleCenter
					},
					transform: {
						local: { position: labelPos }
					}
				}
			});
		return button;
	}

	private decrementScore() {
		this.score-=1;
		this.updateScore();
	}
	private incrementScore() {
		this.score+=1;
		this.updateScore();
	}
	private resetScore() {
		this.score = 0;
		this.updateScore();
	}
	
	private updateScore() {
		try{
			this.actors.findChildrenByName('score', true)[0].text.contents = this.score.toString();
		}catch(e){			
			//console.error(e);
		}
		
	}
}

