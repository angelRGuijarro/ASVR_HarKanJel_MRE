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
	
	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {				
		this.createNewCar();
		this.resetOnClickHandlers();		
	}	
	
	/**
	 * 
	 * @param user User whom clicked the car. Undefined if creating parked car.
	 * @returns new created car
	 */
	private createNewCar(user?: MRE.User) {		
		const nameSuffix = (user !== undefined ? user.name:"default");		
		const boxMesh = this.assets.createBoxMesh('boxMesh_' + nameSuffix, 3, 0.2, 1.5);						
		const invisibleMaterial = this.assets.materials.find(m => m.name === 'invisible');		
		
		return MRE.Actor.CreateFromGltf(this.assets, {
			uri: "cicada_-_retro_cartoon_car.glb", colliderType: "box",
			actor: {
				parentId: this.actors.id,
				name: 'car_cicada_' + nameSuffix,
				appearance: { meshId: boxMesh.id, materialId: invisibleMaterial.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
				transform: {
					local: {
						position: MRE.Vector3.Zero(),
						scale: MRE.Vector3.One(),
						rotation: MRE.Quaternion.FromEulerAngles(0, -90 * MRE.DegreesToRadians, 0)
					}
				}
			}
		});				
	}
	
	/**
	 * Every time a new user enters or a new car is created behabiors must be reset
	 */
	private resetOnClickHandlers(){
		this.context.actors.forEach(actor => {			
			if ((actor.name !== undefined) && (actor.name.includes('car_cicada'))){
				actor.setBehavior(MRE.ButtonBehavior)
					.onClick((user) => this.carOnClick(user));		
			}
		}); 
	}

	/**
	 * 
	 * @param user User that clicked the car. If currently has a car it is destroyed.
	 * @returns true if car has been deteached/destroyed.
	 */
	private detachCar(user: MRE.User): boolean {						
		if (this.attachedCars.has(user.id)) { 
			const car = this.attachedCars.get(user.id);
			//this.attachedCars.get(user.id).detach();
			this.attachedCars.get(user.id).destroy();			
			/**== now should let the car on user's actual position */
			
			this.attachedCars.delete(user.id);
			return true;
		}
		return false;
	}
	
	private carOnClick(user: MRE.User) {	
		/**== should mark user to check its position over time... setInterval ==*/

		if (!this.detachCar(user)){
			//const carClicked = this.actors.findChildrenByName('car_cicada',true)[0];
			const carClicked = this.createNewCar(user);
			carClicked.attach(user.id, 'hips');
			carClicked.transform.local.position = new MRE.Vector3(0.4,0.2,-0.15);
			this.attachedCars.set(user.id, carClicked);
			this.resetOnClickHandlers();		
		}	
	}
	
}