/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { MreArgumentError, ParameterSet, Quaternion } from '@microsoft/mixed-reality-extension-sdk';
import { resolve } from 'dns';
import { parse } from 'path';
import { URLSearchParams } from 'url';
import { inherits } from 'util';
import Utils from './Utils';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class ModelsManager {		
	private params: URLSearchParams;
	private assetContainer = new MRE.AssetContainer(this.context);
	private text: MRE.Actor = null;
	private utils: Utils;

	constructor(private context: MRE.Context,params: ParameterSet) {		
		console.log(`Constructror de MotoTRON`);
		console.log(params);
		this.params = new URLSearchParams(params);		
		this.utils = new Utils(this.context);
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {		
		// this.text = this.utils.MakeText("Testing Flying Cars", MRE.Vector3.Zero());		
		const _uri = this.params.has('model')?this.params.get('model')+'.glb' : 'altspace-cube.glb';
		const _init = Utils.stringToVector3(this.params.get('init'));
		const _end = this.params.has('end')? Utils.stringToVector3(this.params.get('end')) : undefined;
		const _time = this.params.has('time')? parseFloat(this.params.get('time')) : 1;
		const _reverse = this.params.get('reverse') === 'true';
		const _reverseTime = this.params.has('reverseTime')? parseFloat(this.params.get('reverseTime')) : 2;
			
		const model = this.loadModel({uri: _uri, colliderType: 'box'},
			{
				transform: {
					local: {
						position: _init
					}
				}	
			});

		
		model.created().then(_ => {
			if (_end !== undefined){
				const totalTime = (2*_time+2*_reverseTime)*1000;				
				this.animateTo(model, _end, _init, _time, _reverse, _reverseTime)
				setInterval(() => this.animateTo(model, _end, _init, _time, _reverse, _reverseTime), totalTime);
			}
		} );
	}	

	private animateTo(model: MRE.Actor, endPoint: MRE.Vector3, initPoint: MRE.Vector3, timeToGo: number, reverse: boolean, reverseTime: number){			
		//goto first point
		MRE.Animation.AnimateTo(this.context,
			model,
			{
				duration: timeToGo,
				destination: {
					transform: {
						local: {
							position: endPoint
						}
					}
				}
			}).then(_ =>{ //flip
			if (reverse){
				MRE.Animation.AnimateTo(this.context, model,
					{
						duration: reverseTime,
						destination: {
							transform:{
								local:{
									rotation: Utils.QuaternionFromVector3(Utils.stringToVector3('(0,180,0)'))
								}
							}
						}
					}).then(__ => { //come back
					MRE.Animation.AnimateTo(this.context, model, {
						duration: timeToGo,
						destination: {
							transform: {
								local: {
									position: initPoint
								}
							}
						}
					}).then( ___ =>{					
						MRE.Animation.AnimateTo(this.context, model,
							{
								duration: reverseTime,
								destination: {
									transform:{
										local:{
											rotation: Utils.QuaternionFromVector3(Utils.stringToVector3('(0,0,0)'))
										}
									}
								}
							})
						
					})
				})
			}
		})	
	}
	

	private loadModel(gltf?: {uri: string; colliderType?: 'box' | 'mesh'}, 
		actor?: Partial<MRE.ActorLike>): MRE.Actor{		
		
		const _actor = actor !== undefined? actor : 
			{
				transform: {
					local: {
						position: MRE.Vector3.Zero(),
						scale: MRE.Vector3.One().scale(1)
					}
				}
			};

		return MRE.Actor.CreateFromGltf(this.assetContainer,
			{
				uri: gltf !== undefined? gltf.uri : 'altspace-cube.glb',
				colliderType: (gltf !== undefined) && (gltf.colliderType !== undefined)? gltf.colliderType : 'box',
				actor: _actor
			})
	}	
}
