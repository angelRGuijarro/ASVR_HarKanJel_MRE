/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

//import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import {
	Actor,AssetContainer, ButtonBehavior,
	ColliderType, Context,Guid,
	PrimitiveShape, Vector3, User} from '@microsoft/mixed-reality-extension-sdk';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class SoccerMatch {	
	public maxDistance2Kick = 2;
	public kickForce = 5;
	private assets: AssetContainer;
	private jugadores: Map<Guid,Actor>;
	private bola: Actor = null;
	private pateador: ButtonBehavior;

	constructor(private context: Context) {
		console.log(`Constructror de Soccer`);
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new AssetContainer(this.context);
		// guardamos también actores para conocer la posición de los jugadores
		this.jugadores = new Map<Guid,Actor>();		
		//Creamos nuestra pelota
		//this.bola = this.CrearBolaPrimitiva(this.assets);
		this.bola = this.CrearBolaKit(this.assets);

		// Añadimos los actores de jugador a cada usuario
		this.context.onUserJoined((user) => this.onUserJoined(user));
		// Tenemos el cuidado de elminiar los jugadores al salir de la sesión su usuario asociado
		this.context.onUserLeft((user) => this.onUserLeft(user));
		// Set up cursor interaction. We add the input behavior ButtonBehavior to the ball.
		// Button behaviors have two pairs of events: hover start/stop, and click start/stop.		
		//const golpearBola = this.bola.setBehavior(ButtonBehavior);
		this.pateador = this.bola.setBehavior(ButtonBehavior);
		this.pateador.onClick((user) => this.pateaBalon(user));
		
		// When clicked, throw
		// golpearBola.onClick((user) => this.pateaBalon(user));
				
		// Trigger the grow/shrink animations on hover.
		/*buttonBehavior.onHover('enter', () => {
			// use the convenience function "AnimateTo" instead of creating the animation data in advance
			MRE.Animation.AnimateTo(this.context, this.cube, {
				destination: { transform: { local: { scale: { x: 0.5, y: 0.5, z: 0.5 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});
		buttonBehavior.onHover('exit', () => {
			MRE.Animation.AnimateTo(this.context, this.cube, {
				destination: { transform: { local: { scale: { x: 0.4, y: 0.4, z: 0.4 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});
		*/		
	}

	protected CrearBolaKit(assetContainer: AssetContainer): Actor{
		const bolaKit: Actor = Actor.CreateFromLibrary(this.context,{
			resourceId:'artifact:1752910636817318581',
			actor:{
				transform:{
					local:{
						scale: new Vector3(0.4,0.4,0.4)
					}
				},
				grabbable:true,
				//Por algún motivo, esto no funciona al crearlo, hay que activarlo después					
				// rigidBody:{
				// 	useGravity:true,
				// 	mass:0.2,
				// 	enabled:true
				// },
				collider:{
					geometry:{
						shape:ColliderType.Sphere,
						radius:0.35
						//la caja no funciona, porque da vueltas con la bola
						// shape:MRE.ColliderType.Box,
						// size:new Vector3(1,4,1)
					},
					dynamicFriction:0.9,
					bounciness:0.5
				}
				// ,
				// Por algún motivo la bola no aparece si nos suscribimos a collider
				// subscriptions:['collider']
				,subscriptions:['transform']
			}
		});		

		bolaKit.enableRigidBody({			
			mass:0.02,
			useGravity:true
		});
		
		return bolaKit;
	}

	protected CrearBolaPrimitiva(assetContainer: AssetContainer): Actor{
		return Actor.CreatePrimitive(assetContainer,{
			definition:{shape:PrimitiveShape.Sphere,dimensions:Vector3.One()},
			addCollider:true,
			actor:{
				name:'Pelota'/*,
				collider:{
					enabled:true,
					bounciness:2					
				}*/,
				grabbable:true,
				rigidBody:{
					//useGravity:true,
					detectCollisions:true,
					enabled:true,
					mass:0.05
				},
				transform:{local:{position:Vector3.Zero()}}
			}
		});	
	}

	protected onUserJoined(user: User){
		// Creamos al jugador
		const jugador = Actor.CreatePrimitive(this.assets,{
			definition:{
				shape:PrimitiveShape.Box,
				dimensions:Vector3.One()
			},
			addCollider:true
			,actor:{
				appearance:{enabled:false},
				subscriptions:['transform']
			}
		});
		//------------------------------------------
		//el colider puede servir para lanzar eventos
		jugador.collider.isTrigger=true;
		//------------------------------------------
		// Lo vinculamos al usuario
		jugador.attach(user.id,"right-foot");
		// lo incluímos en la lista de jugadores
		this.jugadores.set(user.id,jugador);
	}

	protected onUserLeft(user: User){
		// borramos al jugador de la lista de jugadores
		if (this.jugadores.has(user.id)){
			const jugador = this.jugadores.get(user.id);
			jugador.detach();
			jugador.destroy();
			this.jugadores.delete(user.id);
		}
	}

	protected pateaBalon(user: User){
		let patada: Vector3;		
		if (this.jugadores.has(user.id)){
			// posición del jugador
			const j = this.jugadores.get(user.id).transform.app.position;
			// posición de la bola
			const b = this.bola.transform.app.position;
			if (Vector3.Distance(j,b)<this.maxDistance2Kick){
				patada = new Vector3(b.x-j.x,0,b.z-j.z);
				console.log("patada ".concat(patada.toString()));
				patada.normalize();
				console.log("patada normalizada ".concat(patada.toString()));
				patada = new Vector3(patada.x * this.kickForce, this.kickForce,patada.z * this.kickForce);
				console.log("patada final ".concat(patada.toString()));
			}			
			// console.log("jugador ".concat(j.toString()));
			// console.log("bola ".concat(b.toString()));
			// console.log("patada ".concat(patada.toString()));
		}else{
			patada = Vector3.Zero();
		}
		//this.bola.rigidBody.addForce(new Vector3(0,10,0));
		this.bola.rigidBody.addForce(patada);
	}
}
