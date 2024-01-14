import React from 'react';

function Background(Component){
    function Wrapper(props){
        return (
            <>
                <div className='container h-screen mx-auto px-4 bg-center' style={{backgroundImage: 'url(/imgPack/bg.png)'}}>
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