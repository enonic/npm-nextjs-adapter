/// <reference types="react" />

interface Props {
    label: string
    data: any
}

const PropsView = (props: any) => {
    return (
        <div className='debug'
            style={{margin: '10px', padding: '10px', border: '2px solid lightgrey'}}>
            <DataDump label='Page' data={props.page}/>
            <DataDump label='Part' data={props.part}/>
            <DataDump label='Layout' data={props.layout}/>
            <DataDump label='Data' data={props.data}/>
            <DataDump label='Common' data={props.common}/>
        </div>
    );
};

export default PropsView;

const DataDump = ({label, data}: Props) => (
    (data && (
            <>
                {label && (
                    <h5 style={{marginTop: '0', marginBottom: '0'}}>{label}:</h5>
                )}
                <pre style={{
                    fontSize: '.8em',
                    width: '100%',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                }}>{JSON.stringify(data, null, 2)}</pre>
            </>
        )
    ) || null
);
