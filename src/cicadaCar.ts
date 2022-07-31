/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class CicadaCarApp {		
	private assets: MRE.AssetContainer;
	//private prefabs: {[key: string]: MRE.Prefab} = {};
	private actors: MRE.Actor;	
	private attachedCars = new Map<MRE.Guid, MRE.Actor>();
	//private users = new Map<MRE.Guid, MRE.Actor>();
	

	constructor(private context: MRE.Context) {		
		console.log(`Constructror de CarsApp`);
		this.assets = new MRE.AssetContainer(context);
		this.assets.createMaterial('invisible', 
			{ color: MRE.Color4.FromColor3(MRE.Color3.Red(), 0.0), alphaMode: MRE.AlphaMode.Blend });
		this.actors = MRE.Actor.Create(this.context);

		this.context.onStarted(() => this.started());
		this.context.onUserJoined(user => this.resetOnClickHandlers());
		//this.context.onUserJoined(user => this.setPositionMark(user));
		
	}
	
	// private setPositionMark(user: MRE.User): void {
	// 	const positionMark = MRE.Actor.Create(this.context,{
	// 		actor: {
				
	// 		}
	// 	});
	// 	positionMark.attach(user, 'head');
	// }
	
	
	private resetOnClickHandlers(){
		this.context.actors.forEach(actor => {			
			if (actor.name === 'car_cicada'){
				actor.setBehavior(MRE.ButtonBehavior)
					.onClick((user) => this.carOnClick(user));		
			}
		}); 
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {				
		const boxMesh = this.assets.createBoxMesh('boxMesh', 3, 0.2, 1.5);		
		
		const invisibleMaterial = this.assets.materials.find(m => m.name === 'invisible');		
		
		const car = MRE.Actor.CreateFromGltf(this.assets,{
			uri: "cicada_-_retro_cartoon_car.glb", colliderType: "box",
			actor:{
				parentId: this.actors.id,
				name: 'car_cicada',		
				appearance: {meshId: boxMesh.id, materialId: invisibleMaterial.id},
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
				transform: {
					local: {
						position: MRE.Vector3.Zero(),
						scale:	MRE.Vector3.One(),
						rotation: MRE.Quaternion.FromEulerAngles(0,-90*MRE.DegreesToRadians,0)
					}
				}
			}
		})

		// Set a click handler on the button.
		car.setBehavior(MRE.ButtonBehavior)
			.onClick((user) => this.carOnClick(user));		
		
	}	


	private detachCar(user: MRE.User): boolean {				
		if (this.attachedCars.has(user.id)) { 
			this.attachedCars.get(user.id).detach(); //this.attachedCars.get(user.id).destroy();			
			/**== now should let the car on user's actual position */

			
			this.attachedCars.delete(user.id);
			return true;
		}
		return false;
	}
	
	private carOnClick(user: MRE.User) {	
		/**== should mark user to check its position over time... setInterval ==*/


		if (!this.detachCar(user)){
			const carClicked = this.actors.findChildrenByName('car_cicada',true)[0];
			carClicked.attach(user.id, 'hips');
			carClicked.transform.local.position = new MRE.Vector3(0.4,0.2,-0.15);
			this.attachedCars.set(user.id, carClicked);
		}	
	}
	
}
