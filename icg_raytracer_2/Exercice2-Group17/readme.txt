-- read me exercise 2 - ICG --

Task 2.1: Implement Phong Lighting

For this task, our main difficulty was discerning within the many vector and scalar multiplications what was a dot product, what was a component-wise multiplication etc. We solved this by looking at the theoretical formulas. We were then able to translate these formulas into the lightning function, and into the main function.

Task 2.2: Implement shadows

Here, we struggled a little bit because we were not getting the expected output. We realized that we had forgotten to add a condition to when there are shadows : we were simply testing if there was any intersection between the object and the light source, and not making sure that this intersection was before the light source itself. This meant that a large part of our image was only ambient lighting. After fixing this and playing around with the displacement factor to remove the shadow acne, we got the expected output.

Task 2.3.1: Derive iterative formula

Task 2.3.2: Implement reflections

For this task, we had to first discuss how we would translate the theory into the code since we weren't sure to fully understand. After spending some time making sure we fully understand all the elements of the formula and what they represent in the code, we changed the main function to include reflections. We first made the mistake of not separating the final pixel color with the output of the lighting function, but quickly realized what was wrong and fixed it. In the included screenshots, we set NUM_REFLECTIONS to 2.

- WORKLOAD
Tom 40 %
Louise 30 %
Emmanuelle 30 %
