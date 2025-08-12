window.addEventListener('load', function(){
    //Canvas Set-Up
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); //How we draw the canvas
    canvas.width = 1500; //Width of canvas
    canvas.height = 500; //Height of canvas

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => { //The start of how we move our player. (The seahorse.)
                if (( (e.key === 'ArrowUp') || //Moves player up.
                      (e.key === 'ArrowDown') //Moves player down.
                
                )&& this.game.keys.indexOf(e.key) === -1){  // Takes the 'indexOf' our key array and determines which keys are being pressed(For holding down button purposes.)
                    this.game.keys.push(e.key); //If the key is not being pressed, it makes sure to add that to the list in the array so it appears as moving cosntantly when pressed.
                } else if ( e.key === ' '){
                    this.game.player.shootTop();
                } else if (e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1); //If the key is released, splice the key from the array.
                }

            });
        }
    }
    class Projectile {
        constructor(game, x, y){
            this.game = game; //Links the projectile system to the game object.
            this.x = x; //Sets the position.
            this.y = y; //Sets the position.
            this.width = 10; //Width of projectile.
            this.height = 3; //Height of projectile.
            this.speed = 3; //Speed projectiles move.
            this.markedForDeletion = false; //Starting setting(This gets updated depending on what it hits.)
        }
        update(){
            this.x += this.speed;
            if (this.x > this.game.width * .8) this.markedForDeletion = true; //If the bullets hite something, they get deleted.
        }
        draw(context){
            context.fillStyle = 'yellow'; //Color of the bullets
            context.fillRect(this.x, this.y, this.width, this.height); //Fills in the color with the width and height.(Essentially this makes the bullets visible and styled.)
        }

    }
    class Particle {

    }
    class Player {
        constructor(game){
            this.game = game; //Links player movement, collision and etc to the main game.
            this.width = 120; //Size element.
            this.height = 190; //Size element.
            this.x = 20; //Starting x position
            this.y = 100; //Starting y position.
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0; //Controls vertical movement. Starting variable.
            this.maxSpeed = 3; //Can be used to limit movement speed.
            this.projectiles = []; //Holds all of the players projectiles.
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime){
            if (this.game.keys.includes('ArrowUp')) this.speedY = -1; //Move up
            else if (this.game.keys.includes('ArrowDown')) this.speedY = 1; //Move down
            else this.speedY = 0; //Else the player speed is 0 and stops moving.
            this.y += this.speedY; //Links y position to the speed, meaning that the position moves up or down, hence -1 or 1.
            //Handle Projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion); //This is for any projectiles that go off screen. If off screen, deletes it.
            
            
            //Sprite animation logic
            if (this.frameX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0;
            }
            //Power up animation
            if (this.powerUp){
                if (this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1; 
                    this.game.ammo += 0.1;
                }
            }

        }
        draw(context){
            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height); //character
            }
            this.projectiles.forEach(projectile => { //Draw projectiles. (Yellow rectangle as determined in our projectile object.)
            projectile.draw(context);
            });
            const spriteScale = 1;  // Adjust this to scale down or up the sprite.
            context.drawImage(  //This draws the seahorse player sprite. Note: When following along, I had a bug
                this.image, //come up that would essentially not display the full seahorse. I had to put the variable
                this.frameX * this.width, //spriteScale = 1 in the code in order for it to properly display.
                this.frameY * this.height,
                this.width * spriteScale,
                this.height * spriteScale,
                this.x,
                this.y,
                this.width * spriteScale,
                this.height * spriteScale
            );  


        }
        shootTop(){
            if (this.game.ammo > 0){ //If ammo is available.
            this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30)); //This shoots ammo from the seahorses mouth if ammo is available.
            this.game.ammo--; //If ammo is shot, decrease ammo that is available.
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if (this.game.ammo > 0){ //If ammo is available.
            this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
            }
        }
        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }

    }
    class Enemy {//Parent class
        constructor(game){
            this.game = game; //Link game to draw context, etc.
            this.x = this.game.width; //Set enemy position to the far right of the screen, off the 'camera' essentially.
            this.speedX = Math.random() * -1.5 - 0.5; //Each enemy moves at a different speed. To move left, values must be negative.
            this.markedForDeletion = false; //Initial base variable for enemies being deleted or not.
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update(){
            this.x += this.speedX - this.game.speed;//Forgot to add + in +=. This caused a bug in where the enemy's spawned in. Adding the + fixed it.
            if (this.x + this.width < 0) this.markedForDeletion = true; //This states that if our enemy reaches the left side of the screen and the width and x position are less than 0, marked for deletion is true. (Prevents lag),
            if (this.frameX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
        draw(context){
            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height); //Fill in enemy color.
            };
            const spriteScale = 1;
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width * spriteScale,
                this.height * spriteScale,
                this.x, 
                this.y,
                this.width * spriteScale,
                this.height * spriteScale
            )
            context.font = '20px Helvetica'; //Font type of lives.
            context.fillText(this.lives, this.x, this.y); //Draw text.
            context.fillStyle = 'yellow';
        }
    }   
    class Angler1 extends Enemy {//Child class: 
    // This means any methods from above ^^^ can be used by this child class from its 
    // parent if it cannot find it within this current class.

        constructor(game){//This class has its own game constructor because some attributes
        //are specifie only to this class.

            super(game);//This allows us to use angler1's own special game constructor AND
            //its parent classes code. It merges them!
            this.width = 228;//Made enemy sprites smaller as depicted in video for aesthetic purposes.
            this.height = 169; //size of enemy.
            this.y = Math.random() * (this.game.height * 0.9 - this.height); //This puts the enemy at random positions, but limits how far down the sprite can go, to prevent it from going below the floor.
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 2; //How many lives each enemy has. 
            this.score = this.lives; //If the enemy has a larger score, the player score gets updated to how many lives the player took.

        }
    }
    class Angler2 extends Enemy {//Child class: 
    // This means any methods from above ^^^ can be used by this child class from its 
    // parent if it cannot find it within this current class.

        constructor(game){//This class has its own game constructor because some attributes
        //are specifie only to this class.

            super(game);//This allows us to use angler1's own special game constructor AND
            //its parent classes code. It merges them!
            this.width = 213;//Made enemy sprites smaller as depicted in video for aesthetic purposes.
            this.height = 165; //size of enemy.
            this.y = Math.random() * (this.game.height * 0.9 - this.height); //This puts the enemy at random positions, but limits how far down the sprite can go, to prevent it from going below the floor.
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3; //How many lives each enemy has. 
            this.score = this.lives; //If the enemy has a larger score, the player score gets updated to how many lives the player took.

        }
    }
    class LuckyFish extends Enemy {//Child class: 
    // This means any methods from above ^^^ can be used by this child class from its 
    // parent if it cannot find it within this current class.

        constructor(game){//This class has its own game constructor because some attributes
        //are specifie only to this class.

            super(game);//This allows us to use angler1's own special game constructor AND
            //its parent classes code. It merges them!
            this.width = 99;//Made enemy sprites smaller as depicted in video for aesthetic purposes.
            this.height = 95; //size of enemy.
            this.y = Math.random() * (this.game.height * 0.9 - this.height); //This puts the enemy at random positions, but limits how far down the sprite can go, to prevent it from going below the floor.
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3; //How many lives each enemy has. 
            this.score = 15; //If the enemy has a larger score, the player score gets updated to how many lives the player took.
            this.type = 'lucky';

        }
    }
    class Layer {
        constructor(game, image, speedModifier){
            this.game = game; //Links game
            this.image = image; //links image. 
            this.speedModifier = speedModifier; //sets speedModifier variable.
            this.width = 1768; //How big each layer should be
            this.height = 500; //How big each layer should be
            this.x = 0; //Starting position.
            this.y = 0; //Starting position.

        }
        update(){
            if (this.x <= -this.width) this.x = 0; //If the layer has completely moved off screen, reset position to zero.
            this.x -= this.game.speed * this.speedModifier; //This links to the game objects speed and can be modified as needed. 
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y); //Draw image at current x,y position.
            context.drawImage(this.image, this.x + this.width, this.y); //Draw a second instance of the iamge right after the first to give the impression that the image is infinite.
        }

    }
    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1'); //Each layer
            this.image2 = document.getElementById('layer2'); //
            this.image3 = document.getElementById('layer3'); //
            this.image4 = document.getElementById('layer4'); //
            this.layer1 = new Layer(this.game, this.image1, 0.2); //link to game, the image, speed modifier: 0.2
            this.layer2 = new Layer(this.game, this.image2, 0.4); //link to game, the image, speed modifier: 0.4
            this.layer3 = new Layer(this.game, this.image3, 1); //etc.
            this.layer4 = new Layer(this.game, this.image4, 1.5); //etc.
            this.layers = [this.layer1,this.layer2, this.layer3]; //The layers, four is left out to be drawn later because it needs to be drawn after the player (layer).
        }
        update(){
            this.layers.forEach(layer => layer.update()); //Loop through each layer and move it with its update method.
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context)); //Draw context for each layer from layer context draw method.
        }
    }
    class UI {
        constructor(game){
            this.game = game; //Links game
            this.fontSize = 25; //Sets font sie of the score and timer UI and general UI.
            this.fontFamily = 'Helvetica'; //Sets font type.
            this.color = 'white'; //Color of UI text.
        }
        draw(context){
            context.save(); //This is used to save all elements after drawing them.
            context.fillStyle = this.color; //Uses color from above to draw the color.
            context.shadowOffsetX = 2; //Adds shadow to the text
            context.shadowOffsetY = 2; //Shadows
            context.shadowColor = 'black'; //Color of shadow.
            context.font = this.fontSize + 'px ' + this.fontFamily; //Sets the font style for the text.
            //score
            context.fillText('Score: ' + this.game.score, 20, 40); //Draw the score at position 20, 40.
            //ammo
            context.fillStyle = this.color; //Color becomes white(this is for the bullet UI)
            for (let i = 0; i < this.game.ammo; i++){ //This increases the UI of how many bullets are visible based on how much ammo(in the game object) is left.
                context.fillRect(20 + 5 * i, 50, 3, 20);//Note, the more your computer browser is shrunken down, the thicker your bullets appear. Pixels are larger. Just fyi. Caused what I thought was a bullet bug.
            }
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1); //Convert milliseconds to seconds.
            context.fillText('Timer: ' + formattedTime, 20, 100) //Where the timer is located.
            //game over messages
            if (this.game.gameOver){
                context.textAlign = 'center'; //Centers game over text.
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore){ //Links to game object to determine if the game is won, if so, display winning msg.
                    message1 = 'You win!';
                    message2 = 'Well done.';
                } else {
                    message1 = 'You lost.';
                    message2 = 'Try again next time.';
                }
                context.font = '50 ' + this.fontFamily; //Font Style for message1
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40); //Centers game over message.
                context.font = '25 ' + this.fontFamily; //Font style for message2
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            context.restore(); //Restore elements to what they were before the UI elements were saved.
        }
    }
    class Game { //This is where the game logic is and where some variables link to.
        constructor(width, height){
            this.width = width; //game area dimensions
            this.height = height; //

            //Instantiate and link all game core components.
            this.background = new Background(this); 
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);

            //Arrays and timers for gameplay logic.
            this.keys = []; //Stores currently pressed keys.
            this.enemies = []; //Stores active enemies.
            this.enemyTimer = 0; //Tracks time since last enemy spawn
            this.enemyInterval = 1000; //Minimum time between enemy spawns.

            //Ammo system
            this.ammo = 20; //Starting ammo links to projectiles.
            this.maxAmmo = 50; //How much more ammo the player can get over time.
            this.ammoTimer = 0; 
            this.ammoInterval = 500; //How frequently in ms to increase the ammo amount for the player.

            //Game state
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 200; //Score needed to win.

            //Time mechanics
            this.gameTime = 0; //How long the game has been running.
            this.timeLimit = 15000 * 4; //How long the game will run before ending.

            //Game speed.
            this.speed = 1;

            //Debug system
            this.debug = true;
        }
        update(deltaTime){
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval){
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                    if (enemy.type === 'lucky') this.player.enterPowerUp(); //Fixed bug, = did not work and made it so that the angler fish, even the regular ones caused powerups.
                    else this.score--; //Changed the = sign to === and it works correctly now.
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            if (!this.gameOver) this.score += enemy.score; //Only increase gamers score if gameOver is false.
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.background.layer4.draw(context);
        }
        addEnemy(){
            const randomize = Math.random(); //Randomize what enemy gets spawned.
            if (randomize < 0.5) this.enemies.push(new Angler1(this));
            else if (randomize < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new LuckyFish(this));
            
        }
        checkCollision(rect1, rect2){
            return (
                rect1.x < rect2.x + rect2.width &&  //This checks if any x axis coords collide.
                rect1.x + rect1.width > rect2.x &&  //All four of these checks are needed for both horizontal and vertical axises.
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            )
        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    //animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate); //Automatically creates a timestamp for the function that is trying to pass it.
    }
    animate(0);
});