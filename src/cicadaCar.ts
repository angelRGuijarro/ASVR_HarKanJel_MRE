/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Prefab } from '@microsoft/mixed-reality-extension-sdk';
import { timeStamp } from 'console';
import Utils from './Utils';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class CicadaCarApp {		
	private assetsContainer: MRE.AssetContainer;
	private utils: Utils;
	//private prefabs: {[key: string]: MRE.Prefab} = {};
	private actors: MRE.Actor;	
	private attachedCars = new Map<MRE.Guid, MRE.Actor>();
	//private users = new Map<MRE.Guid, MRE.Actor>();
	

	constructor(private context: MRE.Context) {		
		console.log(`Constructror de CarsApp`);
		this.assetsContainer = new MRE.AssetContainer(context);
		// this.assets.createMaterial('invisible', 
		// 	{ color: MRE.Color4.FromColor3(MRE.Color3.Red(), 0.0), alphaMode: MRE.AlphaMode.Blend });
		this.utils = new Utils(context, this.assetsContainer);
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
	private async started() {				
		await this.createNewCar();
		this.resetOnClickHandlers();		
	}	
	
	/**
	 * 
	 * @param user User whom clicked the car. Undefined if creating parked car.
	 * @returns new created car
	 */
	private async createNewCar(user?: MRE.User) {		
		const nameSuffix = (user !== undefined ? user.name:"default");		
		const buttonMesh = this.assetsContainer.createSphereMesh('mesh_' + nameSuffix, 0.1, 0.1, 0.1);						
		//const invisibleMaterial = this.assetsContainer.materials.find(m => m.name === 'invisible');		
		let carPrefab = this.assetsContainer.prefabs.find(m => m.name === 'Scene');		
		if (carPrefab === undefined){
			carPrefab = (await this.assetsContainer.loadGltf('cicada_-_retro_cartoon_car.glb','mesh'))
				.find(a => a.name==='Scene') as Prefab;			
		}
		
		const car = MRE.Actor.CreateFromPrefab(this.context, {		
			prefab: carPrefab,
			actor: {
				parentId: this.actors.id,
				name: 'car_cicada_' + nameSuffix,
				appearance: { meshId:  buttonMesh.id//, 
					//materialId: this.utils.invisibleMaterial.id },
				},
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
		
		const creditsInfo = 'This work is based on "Cicada - Retro Cartoon Car<br>' +
			'(https://sketchfab.com/3d-models/cicada-retro-cartoon-car-135b16b4f77249d8ad13185270f94251)<br>' +
			'by RCC Design (https://sketchfab.com/retrovalorem)<br>' +
			'licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)';
		const creditsTransformLocal = new MRE.ScaledTransform;
		//creditsTransformLocal.position= new MRE.Vector3(-1.64,-0.32,0.4);
		creditsTransformLocal.position= new MRE.Vector3(-1.8,-0.8,0.65);
		creditsTransformLocal.rotation = MRE.Quaternion.FromEulerAngles(
			0 * MRE.DegreesToRadians,
			90 * MRE.DegreesToRadians,
			0 * MRE.DegreesToRadians);
		creditsTransformLocal.scale = new MRE.Vector3(0.4,0.4,1);
		const textPosition = new MRE.Vector3(1.5,3,0);
		this.utils.copyRightInfo(car,creditsInfo,creditsTransformLocal,textPosition);
		
		return car;
	}
	
	/**
	 * Every time a new user enters or a new car is created behabiors must be reset
	 */
	private resetOnClickHandlers(){
		this.context.actors.forEach(actor => {			
			//console.log(actor.toJSON());
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
			//this.attachedCars.get(user.id).detach();
			this.attachedCars.get(user.id).destroy();			
			/**== now should let the car on user's actual position */
			
			this.attachedCars.delete(user.id);
			return true;
		}
		return false;
	}
	
	private async carOnClick(user: MRE.User) {	
		/**== should mark user to check its position over time... setInterval ==*/

		if (!this.detachCar(user)){
			//const carClicked = this.actors.findChildrenByName('car_cicada',true)[0];
			const carClicked: MRE.Actor = await this.createNewCar(user);
			carClicked.attach(user.id, 'hips');
			carClicked.transform.local.position = new MRE.Vector3(0.4,0.2,-0.15);
			this.attachedCars.set(user.id, carClicked);
			this.resetOnClickHandlers();		
		}	
	}
	
}
