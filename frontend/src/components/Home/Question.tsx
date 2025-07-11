import { ChevronRight } from 'lucide-react'
import q2 from '../../assets/q2.jpg'
import q1 from '../../assets/q1.jpg'
import q3 from '../../assets/maditaion.jpg'
const card =[
    {
        id:1,
        name:"แบบคัดกรองโรคซึมเศร้า",
        image:q1
    },
    {
        id:2,
        name:"แบบคัดกรองโรคซึมเศร้า 8 Q",
        image:q2,
    },
    {
        id:3,
        name:"แบบคัดกรองโรคซึมเศร้า 8 Q",
        image:q3,
    },
    {
        id:4,
        name:"แบบคัดกรองโรคซึมเศร้า 8 Q",
        image:q2,
    }
]

function Question (){
    return(
        <div className="flex flex-col xl:px-28  mt-4 ">
            <div className='flex items-center justify-between xl:px-0  px-2 '>
                <p className="kanit-regular text-2xl ">แบบสอบถามทั้งหมด</p>
                <ChevronRight/>
            </div>
            <div className="bg-white w-full xl:rounded-2xl md:p-4 py-4 shadow-sm">
  <div className='flex items-center gap-4 w-full overflow-x-auto xl:overflow-hidden lg:justify-start px-2 md:px-0'>
    {
      card.map(
        (item) => (
          <div key={item.id} className="min-w-[300px] max-w-full bg-cover bg-center rounded-xl p-2 w-72 h-72 flex items-end"
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          >
            <div className='flex-1 flex-col space-y-2 bg-white/50 backdrop-blur-sm h-auto p-4 rounded-lg'>
              <p className='kanit-regular text-center'>{item.name}</p>
              <div className='flex justify-center'>
                <button className='kanit-regular bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] text-white py-1 px-4 rounded-lg'>
                  เริ่มทำแบบทดสอบ
                </button>
              </div>
            </div>
          </div>
        )
      )
    }
  </div>
</div>

        </div>
    )
}
export default Question