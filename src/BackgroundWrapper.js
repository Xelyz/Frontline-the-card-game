import React from 'react';

function Background(Component){
    function Wrapper(props){
        return (
            <>
                <div className='fixed container h-screen left-1/2 -translate-x-1/2 px-4 bg-center brightness-[0.9] contrast-125' style={{backgroundImage: 'url(/imgPack/bg.png)'}}/>
                <div className='container h-screen mx-auto px-4 relative'>
                    {/* general background/heading design */}
                    <p className='text-center font-mono text-2xl text-white absolute top-1 w-full left-0'>Frontline</p>
                    <Component {...props}/>
                </div>
            </>
        )
    }

    return Wrapper
}

export default Background