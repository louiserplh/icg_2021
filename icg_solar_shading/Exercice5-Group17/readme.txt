---- ICG: README Exercice 5 Group 17 ----
Erratum: in the previous README, I wrote Group 24 in the header. Group 24 is my group number of Database project and I keep mistaking it with my ICG group number. Sorry about it.

--- 5.1 ---
-- 5.1.1 --
We computed the rotation of the Billbloard by recalling that the angle between 2 vectors can be found with the scalar product between those. We first tried to implement the rotation in 2 times: rotate along y axis then along x axis. However, it came to us that this would just be more cumbersome, that's why we just directly computed the rotation with the projection of the Billboard's normal on the direction_to_eye vector. We finally deduced geometrically that this rotation should happen along the axis represented by the cross product between between those 2 vectors. The function 'fromRotation' was very useful to compute the new coordinates.

-- 5.1.2 --
In this part, we just modified the alpha component by setting it to a decreasing funtion of the distance from the center. We computed this distance with the norm of the 2D coordinates of the point on the Billboard.
We tested many combinations of functions until finding the one we computed : 2^{-8*dist(center)^2}. We prefered the use of 'exp2' function assuming than power of 2 will be more efficiently computed.

-- 5.1.3 --
For the blending, we mostly used the default function proposed by https://github.com/regl-project/regl/blob/master/API.md#blending. Indeed, after studying https://learnopengl.com/Advanced-OpenGL/Blending, we agreed that the definition of the blending proposed here was coherent with our desired result (namely, implementing the 'one minus src alpha'function).

--- 5.2 ---
-- 5.2.1 --
After simply editing the classes of the drawn objects, we computed the model view and mvp matrices following the description of the pipeline (lecture 5.d slide 4).

-- 5.2.2 --
We first edited the phong.vert.glsl file. The biggest challenge was to correctly compute the projections and return vectors of the correct dimension (switching between homogenous and not homogenous 3D coordinates). Compilation errors were harder to find than before because the JavaScript errors keep poping in the console, flushing quickly the shader file errors that are the useful ones. It took time to us to find that the compilation errors were still there but at the very begining of the console ^^'.

-- 5.2.3 --
This part was a bit straightforward. Strong of the knowledge of previous exercices, we first computed the useful vectors to use and applied the Phong shading as done before.

--- 5.3 ---
This part did not give us too many issues, apart from the initial question of how to combine the gloss and cloud textures. The main difficulties were due to finding out how exactly the specularity should be applied. We are not sure if our current result is correct, but the code seems correct and we do not know how to do it differently.

--- 5.4 ---
Here we decided to model an apple in Blender.

- WORKLOAD
Tom 1/3
Louise 1/3
Emmanuelle 1/3
