import Item from 'antd/es/list/Item';
import meditaion from '../../assets/maditaion.jpg'
import prey from '../../assets/prey.jpg'
const card =[
    {
        id:1,
        image:meditaion,
        title:"ทำสมาธิ",
    },
    {
        id:2,
        image:prey,
        title:"สวดมนต์",
    }
    ,
    {
        id:3,
        image:meditaion,
        title:"ASMR",
    }
    ,{
        id:4,
        image:prey,
        title:"ฝึกลมหายใจ",
    }
]
function Activity() {
    return (
        <div className="lg:px-30  mt-4 bg-transparent">
            <div>
                <h1 className="kanit-regular text-2xl px-2 text-gray-900">กิจกรรมต่างๆ</h1>
            </div>
            <div className="mt-4 flex justify-center w-full ">
                <div className='grid grid-cols-4 gap-4 md:gap-20 duration-300 bg-transparent  '>
                    {
                        card.map(Item=>(
                            <div key={Item.id} className='flex flex-col items-center'>
                                <img src={Item.image} alt="" className='md:w-[150px] md:h-[150px] min-w-[40px] min-h-[40px] rounded-full'/>
                                <p className='kanit-regular md:text-xl text-md '>{Item.title}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
            
        </div>
    );
}
export default Activity