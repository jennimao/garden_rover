document.addEventListener('keydown', (event) => {
    let direction = '';
    switch(event.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
    }
  
    if (direction) {
      fetch(`http://192.168.1.184/move?direction=${direction}`)
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }
  });
  


  // arduino code 

  