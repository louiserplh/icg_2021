---- ICG: README Exercice 7 Group 17 ----

---7.2---
--7.2.1--
For this part, we computed the 1d perlin noise following precisely the description of the handout. We did not meet any issue, however, as our hash function is built for mapping 2D points to gradients, we made an arbitrary choice. Indeed, we selected the second coordinate to be 0., changing it would not have changed the distribution of our noise but could change the values of gradients we get.

---7.3---
--7.3.1--
This part just consist in the sum computation. We implemented it as a for loop: we iteratively compute the sum elements. We also decided to make a slight optimization by avoiding the use of pow function, but rather computing iteratively the powered elements.

---7.4---
--7.4.1--
We used precisely the same procedure and notation as described in course's slides (https://lgg.epfl.ch/teaching/ICG20/icg_lectures/Online08a-Procedural-Modeling.html#/d-perlin-noise-example-5). We did not met any difficulty and prefered avoiding the use of for loop (the notation with many variables looks more familiar and understandable to us).
--7.4.2--
For this part, we stricly copied the 1d version but used the new 2d noise function created.
--7.4.3--
Proceeding exactly as above, we just added the absolute value on the noise function.
--7.5.1--
Nothing to say for this part, we just set weights as said in the handout and called the function mix to mix it with the given colors.
--7.6.1--
For this part, we simply added the necessary lines of code to compute and shade the texture as described by the handout. We had some issues at the shading step which was due to the light direction being miscalculated, but this was quickly ficed. 


WORKLOAD

Tom 1/3
Louise 1/3
Emmanuelle 1/3