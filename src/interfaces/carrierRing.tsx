export interface Moon {
    angularVelocity: number
    radius: number
    positionRadians: number
}

export interface CarrierRing {
    centerX: number
    centerY: number
    radius: number
    moons: Moon[]

    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, elapsed: DOMHighResTimeStamp): void
}

export const createCarrierRing = (centerX: number, centerY: number, radius: number, moons: Moon[]): CarrierRing => {
    return {
        centerX,
        centerY,
        radius,
        moons,
        draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, elapsed: DOMHighResTimeStamp) {

            let intersectionAngles: [number, number][] = []
            intersectionAngles.sort((a, b) => a[0] - b[0])
            for (const moon of this.moons) {
                const alpha = Math.asin(moon.radius / this.radius)
                intersectionAngles.push([moon.positionRadians - alpha, moon.positionRadians + alpha])
            }

            // I need to be unafraid, and come up with a way to do this.
            // let's say we have all the moons, on a number line. I think it will be a good
            // idea to first:
            // identify pairs of indices. each pair will represent moons that overlap in some
            // form. this could mean one is completely within the other, or they overlap slightly
            // next:
            // merge however many consecutive moons overlap. could be three or four or all.
            // then, finally, recreate the intersection angles list.

            // First, find overlapping pairs
            const overlappingPairs: [number, number][] = []
            for (let i = 0; i < this.moons.length; i++) {
                for (let j = i + 1; j < this.moons.length; j++) {
                    const moon1 = this.moons[i]
                    const moon2 = this.moons[j]

                    // Calculate angular distance between moons
                    let angularDist = Math.abs(moon1.positionRadians - moon2.positionRadians)
                    if (angularDist > Math.PI) {
                        angularDist = 2 * Math.PI - angularDist
                    }

                    // Calculate sum of angles they each take up
                    const alpha1 = Math.asin(moon1.radius / this.radius)
                    const alpha2 = Math.asin(moon2.radius / this.radius)

                    // If they overlap, record the pair
                    if (angularDist < (alpha1 + alpha2)) {
                        overlappingPairs.push([i, j])
                    }
                }
            }

            // Create groups of overlapping moons
            const groups: number[][] = []
            for (const [i, j] of overlappingPairs) {
                let foundGroup = false
                for (const group of groups) {
                    if (group.includes(i) || group.includes(j)) {
                        if (!group.includes(i)) group.push(i)
                        if (!group.includes(j)) group.push(j)
                        foundGroup = true
                        break
                    }
                }
                if (!foundGroup) {
                    groups.push([i, j])
                }
            }

            // Merge groups that share members
            let merged = true
            while (merged) {
                merged = false
                for (let i = 0; i < groups.length; i++) {
                    for (let j = i + 1; j < groups.length; j++) {
                        if (groups[i].some(num => groups[j].includes(num))) {
                            groups[i] = [...new Set([...groups[i], ...groups[j]])]
                            groups.splice(j, 1)
                            merged = true
                            break
                        }
                    }
                    if (merged) break
                }
            }

            // Clear and rebuild intersection angles based on groups
            intersectionAngles = []

            // Handle ungrouped moons
            const groupedMoons = new Set(groups.flat())
            for (let i = 0; i < this.moons.length; i++) {
                if (!groupedMoons.has(i)) {
                    const moon = this.moons[i]
                    const alpha = Math.asin(moon.radius / this.radius)
                    intersectionAngles.push([
                        moon.positionRadians - alpha,
                        moon.positionRadians + alpha
                    ])
                }
            }

            // Handle grouped moons
            for (const group of groups) {
                let minAngle = Infinity
                let maxAngle = -Infinity
                for (const moonIndex of group) {
                    const moon = this.moons[moonIndex]
                    const alpha = Math.asin(moon.radius / this.radius)
                    minAngle = Math.min(minAngle, moon.positionRadians - alpha)
                    maxAngle = Math.max(maxAngle, moon.positionRadians + alpha)
                }
                intersectionAngles.push([minAngle, maxAngle])
            }

            // After all intersection angles are added:
            intersectionAngles.sort((a, b) => {
                // Normalize angles for comparison
                let aStart = a[0];
                let bStart = b[0];
                while (aStart < 0) aStart += Math.PI * 2;
                while (bStart < 0) bStart += Math.PI * 2;
                return aStart - bStart;
            });

            const getDrawingColor = (): string => {
                const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
                return isDarkTheme ? "#fff" : "#000"; // White color for dark theme, black for light theme
            };

            for (let i: number = 0; i < intersectionAngles.length; i++) {
                const end1: number = intersectionAngles[i][1];
                const start2: number =
                    intersectionAngles[(i + 1) % intersectionAngles.length][0];

                ctx.beginPath();
                ctx.arc(this.centerX, this.centerY, this.radius, end1, start2);
                ctx.strokeStyle = getDrawingColor();
                ctx.stroke();
                ctx.closePath();
            }

            for (const moon of this.moons) {
                const thisX: number = this.centerX + Math.cos(moon.positionRadians) * this.radius
                const thisY: number = this.centerY + Math.sin(moon.positionRadians) * this.radius

                ctx.beginPath()
                ctx.arc(thisX, thisY, moon.radius, 0, Math.PI * 2)
                ctx.strokeStyle = getDrawingColor();
                ctx.stroke()
                ctx.closePath()

                moon.positionRadians = (moon.positionRadians + moon.angularVelocity * elapsed) % (Math.PI * 2);
                if (moon.positionRadians < 0) {
                    moon.positionRadians += Math.PI * 2;
                }
            }
        }
    }
}