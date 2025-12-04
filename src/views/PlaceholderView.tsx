/// <reference types="react" />


export default function PlaceholderView({type, descriptor}: { type?: string, descriptor?: string }) {
	return (
		<div style={{
			border: '2px solid lightgrey',
			padding: '16px'
		}}>
			<h3 style={{margin: 0, textTransform: 'capitalize'}}>Empty output</h3>
			{descriptor && <p style={{color: 'grey'}}>{`${type} '${descriptor}' output is empty`}</p>}
		</div>
	);
}


