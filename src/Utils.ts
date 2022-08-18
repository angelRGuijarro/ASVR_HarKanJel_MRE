/* eslint-disable no-mixed-spaces-and-tabs */
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Quaternion, Vector2 } from '@microsoft/mixed-reality-extension-sdk';

/**
 * 
 */
export default class Utils {	
    private context: MRE.Context;    
    private assetsContainer: MRE.AssetContainer;
    public readonly invisibleMaterial: MRE.Material;

    constructor (context: MRE.Context, assetsContainer?: MRE.AssetContainer){
    	this.context=context;
    	if (assetsContainer !== undefined){
    		this.assetsContainer = assetsContainer;
    		this.assetsContainer.createMaterial('invisible', 
    			{ color: MRE.Color4.FromColor3(MRE.Color3.Red(), 0.0), alphaMode: MRE.AlphaMode.Blend });
    		this.invisibleMaterial = this.assetsContainer.materials.find(m => m.name === 'invisible');
    	}
    }

    public copyRightInfo(parent: MRE.Actor,copyRightInfoText: string, 
    	transformLocal?: MRE.ScaledTransform, textPosition?: MRE.Vector3){				
    	//Create button		
    	const button = MRE.Actor.Create(this.context,{
    		actor: {
    			parentId: parent.id,
    			name: 'buttonC',
    			appearance: { meshId: this.assetsContainer.createBoxMesh('buttonCMesh', 0.5, 0.5, 0.1).id,
    				materialId: this.invisibleMaterial.id },
    			collider: { geometry: { shape: MRE.ColliderType.Auto } }
    		}
    	});		

    	button.transform.local = transformLocal!==undefined?transformLocal: new MRE.ScaledTransform();		
    	//click handler for this button    	        
    	button.setBehavior(MRE.ButtonBehavior).onClick(() =>
    		this.showCopyRightInfo(button,copyRightInfoText,textPosition));

    	// Create a label for the button.
    	MRE.Actor.Create(this.context,{
    		actor: {
    			parentId: button.id,
    			name: 'labelButtonC',
    			text: {
    				contents: "(C)",
    				height: 0.3,
    				anchor: MRE.TextAnchorLocation.MiddleCenter
    			}
    		}
    	});
    }

    private showCopyRightInfo(parentActor: MRE.Actor, copyRightText: string, textPosition?: MRE.Vector3){
    	const copyRightInfoText = this.MakeText(copyRightText,textPosition,0.1);
    	copyRightInfoText.parent = parentActor;		
    	setTimeout(() => {
    		copyRightInfoText.destroy();
    	}, 10000); 
    }

    public MakeText(stringText: string, _position?: MRE.Vector3, textSize?: number): MRE.Actor {		
    	//const newText = MRE.Actor.Create(this.context, {
    	const newText = MRE.Actor.Create(this.context, {
    		actor: {
    			name: 'Text',
    			transform: {
    				app: { position: typeof(_position) !== 'undefined'? _position : MRE.Vector3.Zero() }
    			},
    			text: {
    				contents: stringText,
    				anchor: MRE.TextAnchorLocation.MiddleCenter,
    				//color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
    				height: typeof(textSize) !== 'undefined'? textSize : 0.3
    			}
    		}
    	});
    	return newText;
    }

    //convert "(x,y,z)" string to corresponding MRE.Vector3 object
    static stringToVector3(_string: string): MRE.Vector3{		
    	const aEnd = _string.slice(1, _string.length-1).split(',');
    	try{
    		return new MRE.Vector3(parseFloat(aEnd[0]), parseFloat(aEnd[1]), parseFloat(aEnd[2]));
    	}catch{
    		return MRE.Vector3.Zero();
    	}
    }

    
    //Only needs x,y,z from vector
    static QuaternionFromVector3(vector: MRE.Vector3): MRE.Quaternion{		
    	return MRE.Quaternion.FromEulerAngles(
    		vector.x * MRE.DegreesToRadians,
    		vector.y * MRE.DegreesToRadians,
    		vector.z * MRE.DegreesToRadians);
    }
}
