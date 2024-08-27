var config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload () {
    this.load.image('sky', 'assets/fondo.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('Fish', 'assets/Fish.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('idle', 'assets/idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('run', 'assets/run.png', { frameWidth: 32, frameHeight: 32 });
}

function create () {
    // Cargar la imagen de fondo y ajustarla al tamaño del juego
    var background = this.add.image(0, 0, 'sky');
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Crear plataformas
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Crear jugador
    player = this.physics.add.sprite(100, 450, 'idle');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Crear animaciones
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('run', { start: 6, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // Configurar controles
    cursors = this.input.keyboard.createCursorKeys();

    // Crear estrellas (Fish)
    stars = this.physics.add.group({
        key: 'Fish',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setScale(1.5); 
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    // Mostrar el puntaje
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Colisiones
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update () {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.setFlipX(true);  // Gira el personaje a la izquierda
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.setFlipX(false);  // No gira el personaje cuando va a la derecha
    }
    else {
        player.setVelocityX(0);
        player.anims.play('idle', true);  // Reproduce la animación de estar de pie
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar (player, Fish) {
    Fish.disableBody(true, true);

    // Sumar y actualizar el puntaje
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        // Crear un nuevo lote de estrellas
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb (player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('idle');
    gameOver = true;
}

