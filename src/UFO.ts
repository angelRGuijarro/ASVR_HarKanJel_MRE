/* eslint-disable no-mixed-spaces-and-tabs */
/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import Utils from './Utils';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class UFOApp {		
	private utils: Utils;
    private assetsContainer: MRE.AssetContainer;
    private UFOs = new Map<MRE.Guid, MRE.Actor>();

    constructor(private context: MRE.Context){
    	console.log(`Constructror de UFO`);
    	this.assetsContainer = new MRE.AssetContainer(context);
    	this.utils = new Utils(context);
    	this.context.onStarted(() => this.started());
    }

    /**
	 * Once the context is "started", initialize the app.
	 */
    private async started() {
    	console.log("Started UFO");                                                  
    	const loaded = await this.assetsContainer.loadGltf('UFO.glb', 'box');
    	loaded.forEach((asset) =>{ console.log(asset.name) });
    	const ExposedUFO = MRE.Actor.CreateFromPrefab(this.context,
    		{
    			firstPrefabFrom: loaded,
    			collisionLayer: MRE.CollisionLayer.Navigation,
    			actor: {
    				name: "UFO",
    				transform:{
    					local: {
    						position: new MRE.Vector3(0,-1.4,0),
    						scale: new MRE.Vector3(0.75,0.75,0.75),
    						rotation: MRE.Quaternion.FromEulerVector(new MRE.Vector3(0,90*MRE.DegreesToRadians,0))
    					}
    				}
    			}
    		});
    	return;
    	//create UFO                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    	const mainUFO = MRE.Actor.CreateFromGltf(this.assetsContainer,
    		{
    			uri: 'UFO.glb',
    			actor: {
    				name: "UFO",
    				transform:{
    					local: {
    						position: new MRE.Vector3(0,-1.4,0),
    						scale: new MRE.Vector3(0.75,0.75,0.75),
    						rotation: MRE.Quaternion.FromEulerVector(new MRE.Vector3(0,90*MRE.DegreesToRadians,0))
    					}
    				}
    			}
    		});
        
    	//Create UFO on click
    	mainUFO.setBehavior(MRE.ButtonBehavior).onClick(user=>this.createFlyingUFO(user));
    }
    
    private createFlyingUFO(user: MRE.User) {
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
                
    	//create UFO
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

    //You click you fly
    buttonFlyClicked(user: MRE.User, carpet: MRE.Actor): void {
    	//button.rigidBody.addForce(new MRE.Vector3(0,1000,0));
    	//carpet.transform.local.scale = new MRE.Vector3(1,5*carpet.transform.local.scale.y,1);
    	carpet.transform.local.position = new MRE.Vector3(0,-0.9,0);
    	setTimeout(() => {
    		carpet.transform.local.position = new MRE.Vector3(0,-1,0)
    	}, 3000);
        
    	console.log("this.buttonFlyClicked");
    }
}
