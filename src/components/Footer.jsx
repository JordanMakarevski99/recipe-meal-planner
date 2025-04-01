import React from 'react'

function Footer () {
  return (
    <footer className='bg-gray-800 text-gray-400 text-center p-5 mt-12 text-sm'>
      <p>
        © {new Date().getFullYear()} RecipePlanner App. Built with React &
        Tailwind.
      </p>
    </footer>
  )
}

export default Footer
