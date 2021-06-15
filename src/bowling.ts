/*!
* Copyright Ángel Ruiz Guijarro. All rights reserved.
* Licensed under the MIT License.
*/

//import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import {
	Actor,ColliderType, Context,Vector3} from '@microsoft/mixed-reality-extension-sdk';

/** Función para colocar un bolo en una posición */
function CreateBowlingPin(context: Context, appPosition: Vector3): Actor{
	const bowlingPin: Actor = Actor.CreateFromLibrary(context,{
		resourceId:'artifact:1759773291767136656',
		actor:{
			transform:{
				app:{
					position: appPosition
				}
			},
			grabbable:true,				
			collider:{
				geometry:{
					shape:ColliderType.Capsule,
					size: new Vector3(0.3,0.6,0.3)
				}
			},
			subscriptions:['transform']
		}
	});		
	
	bowlingPin.enableRigidBody({			
		mass:0.5,
		useGravity:true
	});
	
	return bowlingPin;
}


function CreateBowlingBall(context: Context, appPosition: Vector3): Actor{
	const bowlingBall: Actor = Actor.CreateFromLibrary(context,{
		resourceId:'artifact:1759773301338538391',
		actor:{
			transform:{
				app:{
					position: appPosition
				}
			},
			grabbable:true,				
			collider:{
				geometry:{
					shape:ColliderType.Sphere
				}
			},
			subscriptions:['transform']
		}
	});		
	
	bowlingBall.enableRigidBody({			
		mass:4,
		useGravity:true
	});
	
	return bowlingBall;
}

/*********************************************************************************************
 * Clase principal de la aplicación. Aquí se resuelve todo.
 *********************************************************************************************/
export default class Bowling {	
	private bowlingPingTriangle = new Array<Actor>();
	private bowlingBall: Actor = null;
	constructor(private context: Context) {		
		this.context.onStarted(() => this.started());
	}
	
	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		//Inicializamos la pila de bolos y la bola
		this.CreateBowlingPinTriangle(this.context,Vector3.Zero());		
		this.bowlingBall = CreateBowlingBall(this.context,new Vector3(0,0,-19));
	}
	
	private CreateBowlingPinTriangle(context: Context, appPosition: Vector3){
		const bPPositions = [ Vector3.Zero(),
			new Vector3(-0.3, 0, 0.3), new Vector3(0.3, 0, 0.3),
			new Vector3(-0.6, 0, 0.6), new Vector3(0, 0, 0.6), new Vector3(0.6, 0, 0.6), 
			new Vector3(-0.9, 0, 0.9), new Vector3(-0.3, 0, 0.9), new Vector3(0.3, 0, 0.9), new Vector3(0.9, 0, 0.9)];
		
		bPPositions.forEach(pos => {
			this.bowlingPingTriangle.push(CreateBowlingPin(context,pos));
		});		
	}
}
