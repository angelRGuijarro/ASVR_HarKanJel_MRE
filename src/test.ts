/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import Utils from './Utils';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class TestApp {		
	private utils: Utils;
	private assetsContainer: MRE.AssetContainer;

	constructor(private context: MRE.Context) {		
		console.log(`Constructror de TestApp`);
		this.assetsContainer = new MRE.AssetContainer(context);
		this.utils = new Utils(context);
		this.context.onStarted(() => this.started());
		//crear una plataforma bajo los pies
		this.context.onUserJoined(user => this.createFlyingCarpet(user));
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {		
		const button = this.createMenuButton("text",new MRE.Vector3(0,1,0),"Muestra texto");
		button.setBehavior(MRE.ButtonBehavior).onClick(user => this.buttonClicked(user));
	}	

	private onUserJoin(user: MRE.User){
		this.createFlyingCarpet(user);
	}

	createFlyingCarpet(user: MRE.User) {
		//button to fly
		const button = MRE.Actor.Create(this.context,
			{
				actor: {
					//parentId: this.actors.id,
					name: 'buttonFly'+user.id,
					appearance: { 
						meshId: this.assetsContainer.createBoxMesh("buttonFlyMesh"+user.id,0.02,0.02,0.001).id},
					collider: { geometry: { shape: MRE.ColliderType.Auto } },
					transform: {
						local: { position: new MRE.Vector3(0,0.3,0.5) }
					},
					attachment: {
						attachPoint: 'spine-top',
						userId: user.id
					}
				}
			});
				
		//create flying carpet
		MRE.Actor.CreateFromGltf(this.assetsContainer,
			{
				uri: 'Anim_UFO.glb',				
				actor: {					
					name: "UFO"+user.id,
					attachment:{
						userId: user.id,
						attachPoint: 'hips'
					},
					transform:{
						local: {
							position: new MRE.Vector3(0,-1.4,0),
							//queda como un casco.. hay que ajustar tamaño de los dados
							// scale: new MRE.Vector3(0.3,0.3,0.3),
							// rotation: MRE.Quaternion.FromEulerVector(new MRE.Vector3(0,90*MRE.DegreesToRadians,0))
							scale: new MRE.Vector3(0.75,0.75,0.75),
							rotation: MRE.Quaternion.FromEulerVector(new MRE.Vector3(0,90*MRE.DegreesToRadians,0))
						}
					}
				}
			});

		const flyingCarpet=MRE.Actor.CreatePrimitive(this.assetsContainer,
			{ 
				actor: {					
					name: "FlyingCarpet"+user.id,
					attachment: {
						attachPoint: 'hips',
						userId: user.id
					},
					transform:{
						local: {
							position: new MRE.Vector3(0,-1,0)
							//position: new MRE.Vector3(0,0,0)
						}
					},
					collider: {
						enabled: true,
						geometry: {
							shape: MRE.ColliderType.Box,
							size: new MRE.Vector3(1,0.01,1)
						},
						layer: MRE.CollisionLayer.Navigation
					}
					// ,
					// subscriptions: ['transform','rigidbody']
				},
				definition: { 
					shape: MRE.PrimitiveShape.Cylinder, 
					dimensions: new MRE.Vector3(1, 0.01, 1)
				}
			});			
		
		button.setBehavior(MRE.ButtonBehavior)
			.onClick((clickerUser)=>this.buttonFlyClicked(clickerUser,flyingCarpet));
	}

	buttonFlyClicked(user: MRE.User, carpet: MRE.Actor): void {
		//button.rigidBody.addForce(new MRE.Vector3(0,1000,0));
		//carpet.transform.local.scale = new MRE.Vector3(1,5*carpet.transform.local.scale.y,1);		
		carpet.transform.local.position = new MRE.Vector3(0,-0.9,0);		
		setTimeout(() => {
			carpet.transform.local.position = new MRE.Vector3(0,-1,0)	
		}, 3000);
		
		console.log("this.buttonFlyClicked");
	}

	private buttonClicked(user: MRE.User){		
		const text = this.utils.MakeText("Probando cosas nuevas");
		//user.prompt("Te vi a ser una prigunta",true).then(respuesta =>{console.log(respuesta)});		
	}

	private createMenuButton(name: string, position: MRE.Vector3, label: string, textHeight?: number): MRE.Actor {
		//Mesh for buttons
		const buttonMesh = this.assetsContainer.createBoxMesh('button' + name, 0.1, 0.1, 0.01);

		const buttonPos = position;
		const labelPos = new MRE.Vector3(0, 0, -0.01);

		const button = MRE.Actor.Create(this.context,
			{
				actor: {
					//parentId: this.actors.id,
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
						height: textHeight !== undefined? textHeight: 0.1,
						anchor: MRE.TextAnchorLocation.MiddleCenter
					},
					transform: {
						local: { position: labelPos }
					}
				}
			});
		return button;
	}
}
